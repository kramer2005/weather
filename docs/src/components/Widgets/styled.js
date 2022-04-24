import styled from 'styled-components'

export const Background = styled.div`
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 640px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  padding: 4rem;
  margin-bottom: 2rem;

  h2 {
    font-size: 4rem;
    margin: 0;
  }

  p {
    margin: 0;
  }

  & > div {
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 2rem;

    img {
      width: 100%;
      height: auto;
      max-height: 4rem;
    }
  }
`
