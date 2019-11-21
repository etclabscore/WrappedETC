import React, { Component } from "react";
import AddressBar from "./AddressBar";
import TradeMarkBlock from "./TradeMarkBlock";
import SuccessTransaction from "./SuccessTransaction";
import InputField from "./InputField";

class Container extends Component {
  render() {
    return (
      <section className="container">
        <div className="columns">
          <div className="is-half is-offset-one-quarter column">
            <div className="panel">
              {this.props.tx ? <SuccessTransaction tx={this.props.tx} /> : ""}

              <AddressBar account={this.props.account} />
              <div className="panel-block is-paddingless is-12">
                <div className="column is-12" id="token-lists">
                  <InputField
                    onUpdateField={this.props.onUpdateField}
                    fields={this.props.fields}
                    name="amount"
                    placeholder="Amount"
                    addon="ETC"
                  />

                  <div className="field is-grouped is-pulled-right">
                    <p className="control">
                      <a
                        className={
                          this.props.inProgress
                            ? "button is-primary is-loading"
                            : "button is-primary"
                        }
                        disabled={this.props.inProgress}
                        onClick={this.props.handleWrap}
                      >
                        Wrap
                      </a>
                    </p>
                    <p className="control">
                      <a
                        className={
                          this.props.inProgress
                            ? "button is-danger is-loading"
                            : "button is-danger"
                        }
                        disabled={this.props.inProgress}
                        onClick={this.props.handleUnwrap}
                      >
                        Unwrap
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <TradeMarkBlock tx={this.props.tx} />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Container;
