import { CopyOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Modal, Input, Tooltip, notification } from "antd";
import theme from "../../../../../theme-override.json";
import { debounce } from "../../../../shared/util";
import copy from "copy-to-clipboard";
import QR from "qrcode.react";
import React from "react";

class InviteModal extends React.Component<
    {
        visible: boolean;
        roomID: string;
        onHide: () => void;
    },
    {
        copied: boolean;
    }
> {
    state = {
        copied: false,
    };

    get url() {
        return `${window.location.origin}/api/room/${this.props.roomID}/join`;
    }

    copyToClipboard() {
        copy(this.url, {
            onCopy: () => {
                notification.open({
                    message: "Copied!",
                    description: "Copied to clipboard",
                });
                this.setState({
                    copied: true,
                });
                debounce("InviteModalCopyToClipboard", 4500, () => {
                    this.setState({
                        copied: false,
                    });
                });
            },
            format: "text/plain",
        });
    }

    get canShare() {
        if (!("share" in navigator)) {
            return false;
        }

        if ("canShare" in navigator) {
            return (navigator as any).canShare({
                url: this.url,
            });
        }
        return true;
    }

    share() {
        const nav = navigator as any;
        nav.share({
            title: "Sharify invite",
            text: "Invite to sharify room",
            url: this.url,
        });
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                footer={null}
                onCancel={this.props.onHide}
                title="Invite members to room"
            >
                <QR
                    value={this.url}
                    fgColor={theme["primary-color"]}
                    bgColor={"#00000000"}
                    renderAs="svg"
                    style={{
                        width: "100%",
                        height: "100%",
                        marginBottom: "10px",
                    }}
                />
                <Input
                    addonAfter={
                        <>
                            <Tooltip title="Copy to clipboard">
                                <CopyOutlined
                                    style={{
                                        color: this.state.copied
                                            ? theme["primary-color"]
                                            : undefined,
                                        marginRight: this.canShare ? "8px" : 0,
                                    }}
                                    onClick={() => this.copyToClipboard()}
                                />
                            </Tooltip>
                            {this.canShare && (
                                <>
                                    {"|"}
                                    <Tooltip title="Share">
                                        <ShareAltOutlined
                                            onClick={() => this.share()}
                                            style={{ marginLeft: "8px" }}
                                        />
                                    </Tooltip>
                                </>
                            )}
                        </>
                    }
                    defaultValue={this.url}
                    readOnly
                />
            </Modal>
        );
    }
}

export default InviteModal;
