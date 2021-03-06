import React, { Component } from 'react';
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Picker,
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { deleteContact, deleteAllContact, updateContact } from '../store/contact.action';
import { logoutUser } from '../store/connect.action';


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  backgroundGeneral: {
    flex: 1,
    backgroundColor: '#FECB98',
  },
  textStyle: {
    width: 250,
    height: 35,
    backgroundColor: '#FECB98',
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 2,
  },
  editTextStyle: {
    width: 250,
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    fontSize: 20,
    margin: 5,

  },
  textStyleIdentity: {
    width: 250,
    height: 45,
    backgroundColor: '#FECB98',
    fontSize: 25,
    textAlign: 'center',
  },
  editTextStyleIdentity: {
    width: 250,
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    fontSize: 25,
    margin: 5,
  },
  iconAlignement: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  footerIcons: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#FECB98',
  },
  iconSpacing: {
    display: 'flex',
    flexDirection: 'row',
  },
  imageStyle: {
    height: 48,
    width: 48,
    marginTop: 50,
  },
  imageStyleNoGravatar: {
    height: 200,
    width: 200,
  },
  imageStyleGravatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    borderRadius: 100,
    marginTop: 20,
  },
  imageStyleBottom: {
    height: 80,
    width: 80,
  },
  keyboardAvoiding: {
    flex: 2,
  },
  picker: {
    height: 40,
    width: 250,
  },
});

const phoneLength = 10;
const emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export class DetailScreen extends Component {
  static navigationOptions = () => ({
    headerTitle: 'Détails',
  });

  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      firstName: '',
      lastName: '',
      phone: '',
      isValidPhone: true,
      email: '',
      isValidEmail: true,
      gravatar: '',
      profile: '',
      _id: '',
      isEmergencyUser: '',
    };

    this.pickerChange = this.pickerChange.bind(this);
    this.handleContactUpdate = this.handleContactUpdate.bind(this);
    this.handlePhoneInput = this.handlePhoneInput.bind(this);
    this.handleEmailInput = this.handleEmailInput.bind(this);
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.setState({ firstName: navigation.getParam('firstName', 'Un prénom') });
    this.setState({ lastName: navigation.getParam('lastName', 'Un nom') });
    this.setState({ phone: navigation.getParam('phone', 'Un numéro') });
    this.setState({ email: navigation.getParam('email', 'Un email') });
    this.setState({ profile: navigation.getParam('profile', 'Un groupe') });
    this.setState({ _id: navigation.getParam('id', 'un id') });
    this.setState({ gravatar: navigation.getParam('gravatar', null) });
    this.setState({ isEmergencyUser: navigation.getParam('isEmergencyUser', false) });
  }

  onPressEdit() {
    if (!this.state.editMode) {
      this.setState({ editMode: true });
    } else if (this.state.firstName !== '' && this.state.lastName !== ''
                && this.state.isValidPhone && this.state.isValidEmail) {
      this.handleContactUpdate();
    } else {
      Alert.alert('un ou plusieurs champs sont mal renseignés');
    }
  }

  handlePhoneInput(text) {
    if (text.length <= phoneLength) {
      this.setState({
        phone: text,
        isValidPhone: (text.length === phoneLength),
      });
    }
  }

  handleEmailInput(text) {
    this.setState({
      email: text,
      isValidEmail: emailRegEx.test(text),
    });
  }


  handleContactUpdate() {
      this.setState({
        _id: this.state.firstName + this.state.lastName
        + this.state.phone + this.state.email,
      });
      this.props.updateContact(
        this.props.token,
        this.state._id,
        this.state.phone,
        this.state.firstName,
        this.state.lastName,
        this.state.email,
        this.state.profile,
        this.state.gravatar,
        true,
        this.state.isEmergencyUser,
      ).then(() => {
        if (this.props.updateError !== undefined) {
          if (this.props.updateError === 'Security token invalid or expired') {
            Alert.alert('Attention', 'Votre session a expirée');
            this.props.logoutUser();
            this.props.deleteAllContact();
            this.props.navigation.navigate('Login');
          } else {
            Alert.alert(this.props.updateError);
          }
        } else {
          this.setState({ editMode: false });
          this.props.navigation.navigate('Contacts');
        }
      })
        .catch();
  }

  pickerChange(index) {
    this.props.profiles.map((v, i) => {
      if (index === i) {
        this.setState({ profile: this.props.profiles[index] });
      }
    });
  }

  disconnectUser() {
    this.props.logoutUser();
    this.props.deleteAllContact();
    this.props.navigation.navigate('Login');
  }

  render() {
    let imageUser = '';

    if (this.state.gravatar !== null) {
      const image = { uri: this.state.gravatar };
      imageUser = <Image style={styles.imageStyleGravatar} source={image} />;
    } else {
      imageUser = <Image style={styles.imageStyleNoGravatar} source={require('../../assets/user-icon.png')} />;
    }


    return (
      <View style={styles.backgroundGeneral}>
        <ScrollView>
          <KeyboardAvoidingView style={styles.keyboardAvoiding}>
            <View style={[styles.iconAlignement]}>
              <TouchableOpacity
                onPress={
                  () => {
                    if (this.props.connectivity) {
                      Alert.alert(
                        'Attention',
                        'Etes vous sûr de vouloir supprimer le contact ?',
                        [
                          { text: 'NON', onPress: () => false, sytle: 'cancel' },
                          { text: 'OUI', onPress: () => this.props.deleteContact(this.props.token, this.state._id)
                          .then(
                            () => {
                              if (this.props.deleteError !== undefined) {
                                if (this.props.deleteError === 'Security token invalid or expired') {
                                  Alert.alert('Attention', 'Votre session a expiré');
                                  this.disconnectUser();
                                } else {
                                  Alert.alert('Erreur de suppression', this.props.deleteError);
                                }
                              } else {
  
                                this.props.navigation.navigate('Contacts');
                              }
                            },
                          ) 
                        },
                        ],
                      );
                    } else {
                      Alert.alert('Attention', 'Vous n\'êtes pas connecté à Internet');
                    }
                  }
                }
              >
                <Image style={styles.imageStyle} source={require('../../assets/trash-icon.png')} />

              </TouchableOpacity>
              <TouchableOpacity>
                <Image style={styles.imageStyleGravatar} source={{ uri: this.state.gravatar }} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                if(this.props.connectivity){
                  this.onPressEdit();
                }else{
                  Alert.alert('Vous n\'avez pas de connection Internet');
                }
                
              }
                }
              >
                {this.state.editMode ? (
                  <Image style={styles.imageStyle} source={require('../../assets/edit-icon.png')} />
                ) : (
                  <Image style={styles.imageStyle} source={require('../../assets/edit-icon.png')} />
                )
                }


              </TouchableOpacity>


            </View>
            <View style={[styles.container, styles.backgroundGeneral]}>
              <TextInput
                style={this.state.editMode
                  ? styles.editTextStyleIdentity : styles.textStyleIdentity}
                editable={this.state.editMode}
                value={this.state.firstName}
                onChangeText={text => this.setState({ firstName: text })}
              />
              <TextInput
                style={this.state.editMode
                  ? styles.editTextStyleIdentity : styles.textStyleIdentity}
                editable={this.state.editMode}
                value={this.state.lastName}
                onChangeText={text => this.setState({ lastName: text })}
              />
              <TextInput
                style={this.state.editMode ? styles.editTextStyle : styles.textStyle}
                editable={this.state.editMode}
                value={this.state.phone}
                onChangeText={text => this.handlePhoneInput(text)}
              />
              <TextInput
                style={this.state.editMode ? styles.editTextStyle : styles.textStyle}
                editable={this.state.editMode}
                value={this.state.email}
                onChangeText={text => this.handleEmailInput(text)}
              />
              {this.state.editMode ? (
                <Picker
                  selectedValue={this.state.profile}
                  prompt="Profil du contact"
                  mode="dropdown"
                  style={styles.picker}
                  onValueChange={itemIndex => this.pickerChange(itemIndex)}
                >
                  {
                    this.props.profiles.map(v => <Picker.Item key={v} color="#FF6C00" label={v} value={v} />)
                  }
                </Picker>
              ) : (
                <Text style={styles.textStyle}>{this.state.profile}</Text>
              )}


            </View>

          </KeyboardAvoidingView>

        </ScrollView>

        {this.state.editMode ? (
          null
        ) : (
          <View style={styles.footerIcons}>
            <View style={styles.iconSpacing}>
              <TouchableOpacity onPress={() => Linking.openURL(`sms:${this.state.phone}`)}>
                <Image style={styles.imageStyleBottom} source={require('../../assets/sms-icon.png')} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${this.state.email}`)} title="email test">
                <Image style={styles.imageStyleBottom} source={require('../../assets/email-icon.png')} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${this.state.phone}`)}>
                <Image style={styles.imageStyleBottom} source={require('../../assets/phone-icon.png')} />
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    );
  }
}

DetailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  connectivity: PropTypes.bool.isRequired,
  token: PropTypes.string.isRequired,
  deleteContact: PropTypes.func.isRequired,
  deleteAllContact: PropTypes.func.isRequired,
  updateContact: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  profiles: PropTypes.arrayOf(PropTypes.string).isRequired,
  updateError: PropTypes.string,
  deleteError: PropTypes.string,
};

const mapStateToProps = state => ({
  connectivity: state.connect.connectivity,
  token: state.connect.token,
  profiles: state.contact.profiles,
  deleteError: state.connect.deleteError,
  updateError: state.connect.updateError,
});

const mapDispatchToProps = dispatch => ({
  deleteContact: (token, _id) => dispatch(deleteContact(token, _id)),
  updateContact: (token, idContact, phone, firstName,
    lastName, email, profile, gravatar,
    isFamilinkUser, isEmergencyUser) => dispatch(updateContact(token, idContact, phone,
    firstName, lastName, email, profile, gravatar, isFamilinkUser, isEmergencyUser)),
  logoutUser: () => dispatch(logoutUser()),
  deleteAllContact: () => dispatch(deleteAllContact()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailScreen);
