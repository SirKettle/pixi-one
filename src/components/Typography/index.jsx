import styled, { css } from 'styled-components';

export const baseTextStyles = css`
  font-family: monospace;
  font-size: 15px;
  font-weight: 400;
`;

export const Heading = styled.h1`
  ${baseTextStyles}
  font-size: 25px;
  margin: 0 0 20px;
  text-transform: uppercase;
`;

export const Paragraph = styled.p`
  ${baseTextStyles}
  margin: 0 0 10px;
`;

export const SecondaryText = styled.span`
  ${baseTextStyles}
  opacity: 0.5;
`;
