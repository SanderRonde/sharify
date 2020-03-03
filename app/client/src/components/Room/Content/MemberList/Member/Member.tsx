import { UserOutlined, DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import theme from '../../../../../theme-override.json';
import { Row, Card, Avatar, Tooltip, Spin } from 'antd';
import { RoomMember } from '../../../Room';
import Meta from 'antd/lib/card/Meta';
import React from 'react';
import CrownedImage from './CrownedImage';

class Member extends React.Component<
    {
        member: RoomMember;
        currentUserHost: boolean;
        setMemberAdmin(status: boolean): void;
        deleteMember(): void;
    },
    {
        deletingUser: boolean;
        targetAdminStatus: boolean;
    }
> {
    state = {
        deletingUser: false,
        targetAdminStatus: this.props.member.isAdmin,
    };

    setMemberAdmin(status: boolean) {
        this.setState({
            targetAdminStatus: status,
        });
        this.props.setMemberAdmin(status);
    }

    deleteMember() {
        // This will never have to be un-set since the
        // member will just be deleted
        this.setState({
            deletingUser: true,
        });
        this.props.deleteMember();
    }

    render() {
        let name = this.props.member.name;
        if (this.props.member.isHost) {
            name += ' (host)';
        }
        if (this.props.member.isMe) {
            name += ' (me)';
        }
        return (
            <Row style={{ width: '100%' }}>
                <Spin wrapperClassName={"fullWidth"} spinning={this.state.deletingUser} delay={250} style={{ width: '100%' }}> 

                    <Card
                        style={{ width: '100%' }}
                        actions={
                            !this.props.currentUserHost ||
                            this.props.member.isMe
                                ? []
                                : [
                                      <Tooltip
                                          title={
                                              this.props.member.isAdmin
                                                  ? 'Remove admin status'
                                                  : 'Promote to admin'
                                          }
                                      >
                                          <Spin
                                              spinning={
                                                  this.state
                                                      .targetAdminStatus !==
                                                  this.props.member.isAdmin
                                              }
                                              delay={250}
                                          >
                                              <CrownOutlined
                                                  style={{
                                                      color: this.props.member
                                                          .isAdmin
                                                          ? theme[
                                                                'primary-color'
                                                            ]
                                                          : theme[
                                                                'secondary-color'
                                                            ],
                                                  }}
                                                  key="admin"
                                                  onClick={() =>
                                                      this.setMemberAdmin(
                                                          !this.props.member
                                                              .isAdmin
                                                      )
                                                  }
                                              />
                                          </Spin>
                                      </Tooltip>,
                                      <Tooltip title={'Delete from group'}>
                                          <DeleteOutlined
                                              key="delete"
                                              onClick={() =>
                                                  this.deleteMember()
                                              }
                                          />
                                      </Tooltip>,
                                  ]
                        }
                    >
                        <Tooltip title={name}>
                            <Meta
                                avatar={(() => {
                                    const image = this.props.member.image ? (
                                        <Avatar src={this.props.member.image} />
                                    ) : (
                                        <UserOutlined
                                            style={{ fontSize: '32px' }}
                                        />
                                    );
                                    if (this.props.member.isHost) {
                                        return (
                                            <CrownedImage>{image}</CrownedImage>
                                        );
                                    }
                                    return image;
                                })()}
                                title={
                                    <span
                                        style={{
                                            textDecoration: this.props.member
                                                .isMe
                                                ? 'underline'
                                                : 'none',
                                        }}
                                    >
                                        {name}
                                    </span>
                                }
                                description={this.props.member.email}
                            />
                        </Tooltip>
                    </Card>
                </Spin>
            </Row>
        );
    }
}

export default Member;
