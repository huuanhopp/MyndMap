import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Animated, 
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../hooks/userHook';
import { subscribeToDiscussionPosts, addDiscussionPost, editDiscussionPost, deleteDiscussionPost } from '../notifications/firebaseUtils';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

const EMOJIS = [
  { id: 'hearts', source: require('../assets/Hearts.png') },
  { id: 'angry', source: require('../assets/Angry.png') },
  { id: 'laughing', source: require('../assets/Laughing.png') },
  { id: 'shocked', source: require('../assets/Shocked.png') },
  { id: 'sad', source: require('../assets/Sad.png') },
  { id: 'heartbreak', source: require('../assets/Heartbreak.png') },
  { id: 'hello', source: require('../assets/Hello.png') },
  { id: 'hungry', source: require('../assets/Hungry.png') },
  { id: 'thinking', source: require('../assets/Thinking.png') },
  { id: 'tired', source: require('../assets/Tired.png') },
  { id: 'mike', source: require('../assets/Mike.png') },
  { id: 'facepalm', source: require('../assets/Facepalm.png') },
  { id: 'confused', source: require('../assets/Confused.png') },
  { id: 'devil', source: require('../assets/Devil.png') },
  { id: 'done', source: require('../assets/Done.png') },
  { id: 'muscle', source: require('../assets/Muscle.png') },
  { id: 'rip', source: require('../assets/RIP.png') },
  { id: 'awkward', source: require('../assets/Awkward.png') },
  { id: 'loving', source: require('../assets/Loving.png') },
  { id: 'omg', source: require('../assets/OMG.png') },
  { id: 'wow', source: require('../assets/WOW.png') },
  { id: 'money', source: require('../assets/Money.png') },
  { id: 'blushing', source: require('../assets/Blushing.png') },
  { id: 'down', source: require('../assets/Down.png') },
  { id: 'up', source: require('../assets/Up.png') },
];

const EmojiPicker = ({ isVisible, onClose, onEmojiSelected }) => {
  const { t } = useTranslation();
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.emojiPickerContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji.id}
                style={styles.emojiButton}
                onPress={() => {
                  onEmojiSelected(emoji.id);
                  onClose();
                }}
              >
                <Image source={emoji.source} style={styles.emojiImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ModeratorMessage = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.moderatorContainer}>
      <Image source={require('../assets/Arne.jpeg')} style={styles.arneImage} />
      <View style={styles.moderatorContent}>
        <Text style={styles.moderatorName}>{t('discussionForum.moderator.name')}</Text>
        <Text style={styles.moderatorMessage}>
          {t('discussionForum.moderator.message')}
        </Text>
      </View>
    </View>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const DiscussionForumScreen = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputContainerHeight = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const navigation = useNavigation();
  const { user } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    let unsubscribe;
    if (user) {
      unsubscribe = subscribeToDiscussionPosts((updatedPosts) => {
        setPosts(updatedPosts);
        setLoading(false);
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(inputContainerHeight, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(inputContainerHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleEmojiSelect = async (emojiId) => {
    try {
      const post = {
        content: '',
        author: user.uid,
        emojiId: emojiId,
      };
      await addDiscussionPost(post);
    } catch (error) {
      console.error('Error adding emoji post:', error);
      Alert.alert(t('common.error'), t('discussionForum.errors.addEmojiPost'));
    }
  };

  const handleAddPost = async () => {
    if ((newPost.trim() === '' && !selectedImage) || !user) return;

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const post = {
        content: newPost,
        author: user.uid,
        imageUrl: imageUrl,
      };
      await addDiscussionPost(post);
      setNewPost('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error adding new post:', error);
      Alert.alert(t('common.error'), t('discussionForum.errors.addNewPost'));
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost(post.content);
  };

  const handleUpdatePost = async () => {
    if (newPost.trim() === '' || !editingPost) return;

    try {
      await editDiscussionPost(editingPost.id, newPost);
      setEditingPost(null);
      setNewPost('');
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert(t('common.error'), t('discussionForum.errors.updatePost'));
    }
  };

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.assets[0].uri };
        setSelectedImage(source.uri);
      }
    });
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      t('discussionForum.deletePost.title'),
      t('discussionForum.deletePost.message'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('common.delete'), onPress: async () => {
          try {
            await deleteDiscussionPost(postId);
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert(t('common.error'), t('discussionForum.errors.deletePost'));
          }
        }}
      ]
    );
  };

  const getGenderImage = (gender) => {
    switch (gender) {
      case '1':
        return require('../assets/1.png');
      case '2':
        return require('../assets/2.png');
      case '3':
        return require('../assets/3.png');
      default:
        return require('../assets/1.png');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Image source={getGenderImage(item.authorGender)} style={styles.genderIcon} />
          <Text style={styles.postAuthor}>
            {item.authorName}
            <Text style={styles.userTag}> - {t('discussionForum.userTag')}</Text>
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      {item.emojiId ? (
        <Image source={EMOJIS.find(emoji => emoji.id === item.emojiId).source} style={styles.postEmoji} />
      ) : (
        <View>
          <Text style={styles.postContent}>{item.content}</Text>
          {item.edited && <Text style={styles.editedText}>({t('discussionForum.edited')})</Text>}
        </View>
      )}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      {item.author === user.uid && (
        <View style={styles.postActions}>
          {!item.emojiId && (
            <TouchableOpacity onPress={() => handleEditPost(item)} style={styles.editButton}>
              <Icon name="edit" size={20} color="#FF6347" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDeletePost(item.id)} style={styles.deleteButton}>
            <Icon name="trash" size={20} color="#FF6347" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.generalForumButton}
        onPress={() => navigation.navigate('GeneralForum')}
        disabled={true} // Add this line
      >
        <Text style={styles.generalForumButtonText}>{t('discussionForum.goToGeneralForum')}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.loadingText}>{t('discussionForum.loadingPosts')}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.postList}
          ListHeaderComponent={ModeratorMessage}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>{t('discussionForum.noPosts')}</Text>
          }
        />
      )}

      <Animated.View style={[styles.inputContainer, { marginBottom: inputContainerHeight }]}>
        <TextInput
          style={styles.input}
          value={newPost}
          onChangeText={setNewPost}
          placeholder={editingPost ? t('discussionForum.editPostPlaceholder') : t('discussionForum.newPostPlaceholder')}
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={Keyboard.dismiss}
        />
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setIsEmojiPickerVisible(true)}
        >
          <Icon name="smile-o" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={editingPost ? handleUpdatePost : handleAddPost}
        >
          <Text style={styles.addButtonText}>{editingPost ? t('common.update') : t('common.post')}</Text>
        </TouchableOpacity>
      </Animated.View>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
      )}
      <EmojiPicker
        isVisible={isEmojiPickerVisible}
        onClose={() => setIsEmojiPickerVisible(false)}
        onEmojiSelected={handleEmojiSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f7e8d3',
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    color: '#FF6347',
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    left: 30,
    textAlign: 'center', // Center the text
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#F7e8d3',
    fontSize: 16,
    marginTop: 10,
  },
  postList: {
    flex: 1,
  },
  emptyListText: {
    color: '#F7e8d3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  postContainer: {
    backgroundColor: '#222',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTag: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    marginRight: 10,
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  editedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#1a1a1a',
    borderWidth: 0.5,
    borderColor: "#FF6347",
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#FF6347',
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    color: '#F7e8d3',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f7e8d3',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#F7e8d3',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  emojiButton: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    marginRight: 10,
  },
  emojiButtonText: {
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  moderatorContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7e8d3',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  arneImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#FF6347"
  },
  moderatorContent: {
    flex: 1,
  },
  moderatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 5,
  },
  moderatorMessage: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
    borderRadius: 8,
  },
  generalForumButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    margin: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  generalForumButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    opacity: 0.5
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 210
  },
  emojiPickerContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '80%',
  },
  emojiButton: {
    padding: 10,
  },
  emojiText: {
    fontSize: 24,
  },
  emojiImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  postEmoji: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  }
});

export default DiscussionForumScreen;