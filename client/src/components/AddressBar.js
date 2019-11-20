import React from "react";

function addressBar(props) {
  return (
    <div>
      <p className={"panel-heading has-text-centered is-clipped is-size-7"}>
        <strong>{props.account}</strong>
      </p>
      <p className={"panel-heading has-text-centered is-clipped is-size-7"}>
        ETC Balance: <strong>{props.etcBalance}</strong> | WETC Balance:{" "}
        <strong>{props.wetcBalance}</strong>
      </p>
    </div>
  );
}

export default addressBar;
