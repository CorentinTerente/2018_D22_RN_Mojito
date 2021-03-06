import React, { Component } from 'react';
import { NetInfo } from 'react-native';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AppContainer from '../screen/StackNavigator';
import { updateConnectivity } from '../store/connect.action';

export class ConnectContainer extends Component {
  constructor(props) {
    super(props);

    this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange,
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange(isConnected) {
    this.props.updateConnectivity(isConnected);
  }

  render() {
    return (
      <AppContainer />
    );
  }
}

ConnectContainer.propTypes = {
  updateConnectivity: PropTypes.func.isRequired,
};
const mapStateToProps = state => ({
});
const mapDispatchToProps = dispatch => ({
  updateConnectivity: connectivity => dispatch(updateConnectivity(connectivity)),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConnectContainer);
