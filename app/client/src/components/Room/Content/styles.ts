import styled from "styled-components";
import media from "styled-media-query";

export const Container = styled.div`
    margin-top: 5%;
    width: 100%;
`;

export const MemberListContainer = styled.div`
    ${media.greaterThan("769px" as any)`
		max-height: 70vh;
	`}

    overflow-y: auto;
`;
