import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Bubble, GiftedChat} from 'react-native-gifted-chat';
import {Avatar} from 'react-native-elements';
import {useSelector} from 'react-redux';
import BackArrow2 from '../svg/BackArrow2';

const ChatComponent = ({
  setIsChatComponent,
  messages,
  handleSendMessage,
  setUnseenMessagesCount,
  handleSeenAllMessges,
}: any) => {
  const userId = useSelector((store: any) => store.userId);

  const handleGoBack = () => {
    handleSeenAllMessges();
    setUnseenMessagesCount(0);
    setIsChatComponent(false);
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        textStyle={{left: {color: 'black'}}}
        wrapperStyle={{
          left: {backgroundColor: 'white'},
          right: {backgroundColor: '#404080'},
        }}
      />
    );
  };

  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      handleSeenAllMessges();
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    handleSeenAllMessges();
  }, [messages]);

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={handleGoBack}>
          <BackArrow2 />
        </TouchableOpacity>

        <View style={styles.riderData}>
          <Text style={styles.textRiderName}>Rider Name</Text>
          <Avatar
            rounded
            icon={{name: 'user', type: 'font-awesome'}}
            source={{
              //   uri: auth?.currentUser?.photoURL,
              uri: 'https://png.pngtree.com/png-clipart/20210915/ourmid/pngtree-user-avatar-placeholder-black-png-image_3918427.jpg',
            }}
          />
        </View>
      </View>

      <View style={styles.chatView}>
        <GiftedChat
          messages={messages}
          onSend={messages => handleSendMessage(messages)}
          renderBubble={renderBubble}
          showAvatarForEveryMessage={true}
          scrollToBottom={true}
          timeTextStyle={{
            left: {
              color: 'black',
            },
          }}
          maxInputLength={100}
          isTyping={true}
          user={{
            _id: userId,
            name: 'Driver Name',
            avatar:
              'https://png.pngtree.com/png-clipart/20210915/ourmid/pngtree-user-avatar-placeholder-black-png-image_3918427.jpg',
          }}
          // inverted={false}
          // renderBubble={props => renderBubble(props)}
          // scrollToBottomOffset={hp(1)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingLeft: wp(1),
    paddingRight: wp(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: hp(0.1),
    height: hp(7),
    backgroundColor: '#E5E4E2',
  },
  riderData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginLeft: wp(2),
  },
  textRiderName: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: wp(5),
    fontWeight: '900',
    color: 'black',
  },
  backIcon: {
    marginRight: wp(2),
  },
  chatView: {flex: 1, width: wp(100)},
});

export default ChatComponent;
