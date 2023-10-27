import React, { useState } from "react";

function Home({userName}) {
  return (
    <div>
      <h1>Welcome to HoneyWhere{userName ? `, ${userName}` : ''}!</h1>
    </div>
  );
}

export default Home;
