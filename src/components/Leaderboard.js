import React from 'react';

const Leaderboard = ({ scores, style = {} }) => {
  return (
    <div style={{ textAlign: 'center', ...style }}>
      <h3 style={{ margin: '10px 0' }}>Leaderboard</h3>
      <ol style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
        {scores.map((s, i) => (
          <li key={i} style={{ margin: '2px 0' }}>{i + 1}. {s}</li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
