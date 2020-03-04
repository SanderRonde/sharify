import { Verticalcenterer } from '../../../shared/styles';
import { RoomMember } from "../../../../../../shared/ws";
import InviteModal from './InviteModal/InviteModal';
import { PlusOutlined } from '@ant-design/icons';
import { Spin, Card, Tooltip, notification } from 'antd';
import Member from './Member/Member';
import React from 'react';

class MemberList extends React.Component<
    {
        members: RoomMember[];
        roomID: string;
    },
    {
        modalVisible: boolean;
    }
> {
    state = {
        modalVisible: false,
    };

    async setMemberAdmin(member: RoomMember, status: boolean) {
        try {
            const result = await fetch('/api/user/admin', {
                method: 'post',
                body: JSON.stringify({
                    room: this.props.roomID,
                    userID: member.id,
                    status: status
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const { success, error } = (await result.json()) as {
                success: boolean;
                error?: string;
            }
            if (success) {
                notification.open({
                    message: 'Success',
                    description: status ? 'Promoted to admin' : 'Removed admin status'
                });
            } else {
                notification.open({
                    message: 'Error',
                    description: error!
                });
            }
        } catch(e) {
            notification.open({
                message: 'Request failed',
                description: 'Failed to send request'
            });
        }
    }

    async deleteMember(member: RoomMember) {
        try {
            const result = await fetch('/api/user/kick', {
                method: 'post',
                body: JSON.stringify({
                    room: this.props.roomID,
                    userID: member.id
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const { success, error } = (await result.json()) as {
                success: boolean;
                error?: string;
            }
            if (success) {
                notification.open({
                    message: 'Success',
                    description: 'Kicked user from room'
                });
            } else {
                notification.open({
                    message: 'Error',
                    description: error!
                });
            }
        } catch(e) {
            notification.open({
                message: 'Request failed',
                description: 'Failed to send request'
            });
        }
    }

    render() {
        if (this.props.members.length === 0) {
            return (
                <Verticalcenterer style={{ minHeight: '70vh'  }}>
                    <Spin style={{ width: '100%' }} size="large" />
                </Verticalcenterer>
            );
        }

        const currentUserHost = this.props.members.some(
            (m) => m.isMe && m.isHost
        );
        const sortedMembers = this.props.members.sort((member1, member2) => {
            if (member1.isHost !== member2.isHost) {
                if (member1.isHost) return -1;
                if (member2.isHost) return 1;
            }
            if (member1.isAdmin !== member2.isAdmin) {
                if (member1.isAdmin) return -1;
                if (member2.isAdmin) return 1;
            }
            return 0;
        });

        return (
            <>
                <InviteModal
                    roomID={this.props.roomID}
                    onHide={() =>
                        this.setState({
                            modalVisible: false,
                        })
                    }
                    visible={this.state.modalVisible}
                />
                {sortedMembers.map((member) => (
                    <Member
                        key={member.id}
                        currentUserHost={currentUserHost}
                        member={member}
                        deleteMember={() => this.deleteMember(member)}
                        setMemberAdmin={(status: boolean) =>
                            this.setMemberAdmin(member, status)
                        }
                    />
                ))}
                <Tooltip title="Invite members">
                    <Card
                        hoverable
                        style={{ textAlign: 'center' }}
                        onClick={() =>
                            this.setState({
                                modalVisible: true,
                            })
                        }
                    >
                        <PlusOutlined style={{ fontSize: '30px' }} />
                    </Card>
                </Tooltip>
            </>
        );
    }
}

export default MemberList;
