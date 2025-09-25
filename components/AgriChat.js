import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateChatResponse } from '../services/geminiService';

const AgriChat = ({ location }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your agricultural assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      console.log('📡 Sending message to Gemini...');

      // Call Gemini service
      const botResponse = await generateChatResponse(inputText, { 
        location,
        previousMessages: messages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }))
      });

      console.log('🤖 Received response from Gemini:', botResponse);

      // ✅ Extract clean text from Gemini response
      let responseText = '';
      if (typeof botResponse === 'string') {
        responseText = botResponse;
      } else if (botResponse && typeof botResponse.text === 'string') {
        responseText = botResponse.text;
      } else if (botResponse && typeof botResponse.text === 'function') {
        try {
          responseText = botResponse.text();
        } catch (e) {
          console.error('Error calling botResponse.text():', e);
          responseText = '⚠️ Error processing AI response.';
        }
      } else if (botResponse && botResponse.response) {
        responseText = botResponse.response;
      } else {
        responseText = '⚠️ AI did not return a valid text response.';
        console.warn('Unexpected response format:', botResponse);
      }

      // Add bot reply
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: responseText,
          sender: 'bot' 
        }
      ]);
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      let errorMessage = '⚠️ Sorry, I encountered an error. Please try again later.';

      if (error.message?.includes('API key')) {
        errorMessage = '🔑 Error: Invalid or missing API key. Please check your configuration.';
      } else if (error.message?.includes('model')) {
        errorMessage = '⚠️ Error: Issue with the AI model. Please try again later.';
      } else if (error.message?.includes('network')) {
        errorMessage = '🌐 Error: Network issue. Please check your connection and retry.';
      }

      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          text: errorMessage,
          sender: 'bot' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View 
      style={[
        styles.messageContainer, 
        item.sender === 'user' ? styles.userMessage : styles.botMessage
      ]}
    >
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : {}
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about crops, soil, or selling advice..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  botMessage: {
    backgroundColor: '#e9f5ff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AgriChat;
