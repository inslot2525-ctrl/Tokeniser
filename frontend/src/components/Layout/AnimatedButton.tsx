import styled from "styled-components";

interface Props {
  text: string;
  onClick?: () => void;
}

const StyledButton = styled.button`
  position: relative;
  padding: 0.75rem 2rem;
  font-weight: 600;
  color: white;
  border-radius: 9999px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(6, 182, 212, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function AnimatedButton({ text, onClick }: Props) {
  return <StyledButton onClick={onClick}>{text}</StyledButton>;
}
