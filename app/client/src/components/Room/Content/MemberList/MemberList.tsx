import { Verticalcenterer } from "../../../shared/styles";
import { RoomMember } from "../../Room";
import { Spin } from "antd";
import React from "react";

class MemberList extends React.Component<{
	members: RoomMember[];
}> {
	render() {
		if (this.props.members.length === 0) {
			return (
				<Verticalcenterer>
					<Spin style={{ width: "100%" }} size="large" />
				</Verticalcenterer>
			);
		}

		return (
			<>
				{ "Users" }
			</>
		)
	}
}

export default MemberList;