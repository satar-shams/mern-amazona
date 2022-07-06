import React from 'react';
const div = {
  overflow: 'hidden',
  textAlign: 'center',
};

const span = {
  backgroundColor: 'red',
  color: 'white',
  textAlign: 'center',
  borderRadius: '5px',
  display: 'inline-block',
  fontSize: '2rem',

  margin: '10px 10px 0 0',
  padding: '5px 10px',
};

function MessageBox(props) {
  const { message } = props;
  return (
    <div style={div}>
      <br />
      <span style={span}>{message}</span>
    </div>
  );
}

export default MessageBox;
