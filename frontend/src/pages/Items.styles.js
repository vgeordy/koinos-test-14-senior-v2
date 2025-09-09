import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

export const Page = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px;
  background: #fafafa;
  min-height: 100vh;
`;

export const Container = styled.div`
  flex: 1;
  max-width: 600px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
`;

export const SearchInput = styled.input`
  padding: 8px 10px;
  width: 100%;
  margin-bottom: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  outline: none;
  &:focus {
    border-color: #7aa7ff;
    box-shadow: 0 0 0 3px rgba(122, 167, 255, 0.25);
  }
`;

// transient prop to avoid DOM warnings (use `$error` instead of `error`)
export const StatusLine = styled.div`
  margin-bottom: 8px;
  min-height: 1.5em;
  font-size: 0.9rem;
  color: ${(p) => (p.$error ? 'crimson' : 'inherit')};
`;

export const RowContainer = styled.div`
  padding: 0 12px;
  display: flex;
  align-items: center;
  height: 100%;
  border-bottom: 1px solid #f2f2f2;
`;

export const ItemLink = styled(Link)`
  text-decoration: none;
  color: #0b69d4;
  &:hover {
    text-decoration: underline;
  }
`;

const shine = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export const Skeleton = styled.div`
  height: 16px;
  width: 70%;
  border-radius: 6px;
  background: linear-gradient(90deg, #eee, #ddd, #eee);
  background-size: 200% 100%;
  animation: ${shine} 1.2s ease-in-out infinite;
`;

export const LoadMoreButton = styled.button`
  margin-top: 16px;
  padding: 10px 14px;
  border: 1px solid #d0d0d0;
  background: #0077cc;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;

  &:hover:enabled {
    background: #005fa3;
  }

  &:disabled {
    background: #e0e0e0;
    color: #888;
    cursor: not-allowed;
  }
`;
