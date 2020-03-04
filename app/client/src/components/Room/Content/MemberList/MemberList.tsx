import { Verticalcenterer } from '../../../shared/styles';
import InviteModal from './InviteModal/InviteModal';
import { PlusOutlined } from '@ant-design/icons';
import { Spin, Card, Tooltip } from 'antd';
import { RoomMember } from '../../Room';
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

    setMemberAdmin(member: RoomMember, status: boolean) {
        console.log('Set status', member, status);
        // TODO:
    }

    deleteMember(member: RoomMember) {
        console.log('Delete', member);
        // TODO:
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
