import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF6347"
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7e8d3',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  captionText: {
    fontSize: 12,
    color: "#FF6347",
    fontWeight: "bold",
    fontStyle: "italic"
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  messageWrapper: {
    marginVertical: 4,
    backgroundColor: 'transparent',
  },
  messageContainer: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  arneMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(230,208,181,0.15)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(74,105,189,0.15)',
  },
  messageText: {
    fontSize: 16,
    color: '#f7e8d3',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  optionText: {
    fontSize: 14,
    color: "#f7e8d3",
    fontWeight: "600",
    textAlign: 'center'
  },
  headerButton: {
    padding: 10,
    marginHorizontal: 5,
  },
});