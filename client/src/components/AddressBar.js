import React from "react";

function addressBar(props) {
  return (
    <div>
      <p className={"panel-heading has-text-centered is-clipped is-size-7"}>
        <strong>{props.account.address}</strong>
      </p>
      <p className={"panel-heading has-text-centered is-clipped is-size-7"}>
        ETC Balance: <strong>{props.account.etcBalance}</strong> | WETC Balance:{" "}
        <strong>{props.account.wetcBalance}</strong>
      </p>
    </div>
  );
}

export default addressBar;
