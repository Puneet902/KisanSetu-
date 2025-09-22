import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { generateChatResponse } from '../services/geminiService';
import useLocalization from '../hooks/useLocalization';

export default function ChatbotWidget() {
  const { t } = useLocalization();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (messages.length && scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const reply = await generateChatResponse(input, messages, 'en');
      setMessages((m) => [...m, { sender: 'bot', text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { sender: 'bot', text: 'Error' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={cbStyles.card}>
      <Text style={cbStyles.title}>{t('aiChat')}</Text>
      <ScrollView ref={scrollRef} style={cbStyles.messages}>
        {messages.map((msg, i) => (
          <View key={i} style={[cbStyles.message, msg.sender === 'user' ? cbStyles.user : cbStyles.bot]}>
            <Text style={{color: msg.sender === 'user' ? '#fff' : '#111'}}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={cbStyles.inputRow}>
        <TextInput value={input} onChangeText={setInput} style={cbStyles.input} placeholder={t('typeMessage')} />
        <TouchableOpacity onPress={handleSend} style={cbStyles.sendButton} disabled={isLoading}>
          <Text style={{color:'#fff'}}>{isLoading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cbStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 8, borderRadius: 10, borderWidth:1, borderColor:'#e5e7eb', height: 400 },
  title: { fontWeight: '700', marginBottom: 6 },
  messages: { flex: 1, marginBottom: 6 },
  message: { padding: 8, marginVertical: 4, borderRadius: 8, maxWidth: '85%' },
  user: { backgroundColor: '#16a34a', alignSelf: 'flex-end' },
  bot: { backgroundColor: '#e5e7eb', alignSelf: 'flex-start' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 10, borderWidth:1, borderColor:'#d1d5db', borderRadius: 20 },
  sendButton: { backgroundColor: '#16a34a', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 }
});
