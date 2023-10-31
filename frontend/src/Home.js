import React, { useState } from "react";

function Home({ userName }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Welcome to HoneyWhere{userName ? `, ${userName}` : ""}!</h1>
    </div>
  );
}

export default Home;
