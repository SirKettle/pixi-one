import styled, { css } from 'styled-components';

const debugStyles = css`
	&:before {
  	display: block;
    content: '${({ name }) => name || 'Unspecified'}';
    background: pink;
    color: white;
    font-family: monospace;
    font-size: 11px;
  	padding: 10px;
  	margin: -10px -10px 10px;
  }
  border: solid 1px pink;
  // margin: auto;
  padding: 10px;`;

export const Wrapper = styled.div`
  ${({ debug = false }) => (debug ? debugStyles : '')}
`;
