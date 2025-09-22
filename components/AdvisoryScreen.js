import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { ChevronLeftIcon, MicIcon, CameraIcon, SendIcon, LogoIcon } from './Icons';
import { generateChatResponse } from '../services/geminiService';

const commonQuestionsData = [
  { key: 'What crops should I add?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAq9ADrufO6L_FLDVa2HULD5F5P0HvYuDYtHR8_SrWKQKq6e3I7Rs8XThsJJV-lT5I8JzUI-eq6-a66gMq6yfMf_zDw0ku0E3F9YSeo_R0BlSw8jwiMNKtLS2b49-vBvyyqRTq1Y5Ps6ZvMytQFZOSbeqLAGS0TYO6VE3D-9Ks5dc0CiLNB8axv2pHczM3qXqiYiep96JU95-Xnn-eZT6x6_bZfqsgKWS8JlLdf1d-z1md1s5ljyxDL9z52XH8dO9g9qFLfS6LxliP' },
  { key: 'When is the right time to cut the crops?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX8-yY4WE06eSYYL3nIrpE3EBaw0I494zREeYWfHUsIBS2ggKhNAZigmeha3FSfVYw1LNlx009LikmSMfZRgHwcXIENkBrI9M9sAiKf_j9uymA6xh9_UsHQDru-41Zino6eleFUD9Mzmpyjpf_kkODEDq0ebVbfdRXQROvlqpTCc6tGiNeBLUHLem_slKspQu_2kdCv2s94bnvNEo7a_0dKnToCE_mk2LaTEzzt6seWfEBsV5XPUHYl03mlPKbULS0VUQEI2OVWypY' },
  { key: 'What kind of pesticides should I use and fertilizers?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtik0QhPBNWe-287X6WyJcRl_RB2iqIae2-ZAgnwhyib7o-b2qG2Ijuy-ukrMIwaetLwy6GH0AVQvZnYuNZX1fW-I96pD17VN1k-duxx3ArI1hOgkzeJTxejUlU-CtfNlk7GzVmg54gVikmnq7zzjx72LJXPUwP6SgIsuU7Do5BHM0r6rkqfEmp4NolDRYRyT-K_UIvnr2m0mLenyJB5a6A3bXDikkUFAzvW7IuuyFVE9YPOCqDhNJMtsusoFCgfdHP7RHpT1ijqGy' },
  { key: 'When to sell?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT_4bgwwlatzmmG5mqTSuD0oQRlqD9yLmkNcEJFLeyz3Ml0D3dNcPKkLbOlgK2JLJhdCWpGhv28RfdJbRBGmjTnatFheUeFeGZTInzIp6P8ditF5JwNtSoEj6kH2nY0G8NTAZ_gOOgUuZbHkwI64shbGn13x16UWrpsrZlvztmlWJ5LK_FMrtJ8o5fYDuQ9ywAqlbGfhobKQRdycLQJt6pXjnxSkrdxvducpycXGXRlR585IrcK410v2-P-g9X3-x1btR-lvjsmjPZ' },
  { key: 'How to maximize profits?', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfy2tAhvDkBYptM_H-LwlO15nbUgIthgK9VI4Lg8izOMDmCzeHbqHhtjKs0EjQusy6yAg15tcfaew8lh9GOyd44yFykpjQT9Qb4-h12UA4NyzcHP0qXTCTq6z3Wa1yfKwOkLQbO4S0qRxHJmFpWEOln9wPygOA8Nh8iDgkLL11obmD2ljzA4kjUwwxP44Y2UF4PTkvYGbVZRoEUo2w2XA6J6S6FY5Y5l17VtwqQni7T8r_2DUv7rT00DVH_hIQlcLDzdnGCh5W5JMQ' }
];

const AdvisoryScreen = () => {
  const { t, language } = useLocalization();
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (isChatting) scrollToBottom();
  }, [messages, isChatting]);

  const startChat = async (question) => {
    if (!question.trim()) return;
    setIsChatting(true);
    setMessages([{ sender: 'user', text: question }]);
    setIsLoading(true);
    const responseText = await generateChatResponse(question, [], language);
    setMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
    setIsLoading(false);
  };

  const handleSendFollowUp = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const responseText = await generateChatResponse(input, history, language);
    setMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
    setIsLoading(false);
  };

  const QuestionCard = ({ questionKey, imageUrl }) => (
    <TouchableOpacity style={styles.questionCard} onPress={() => startChat(t(questionKey))}>
      <Image source={{ uri: imageUrl }} style={styles.questionImage} />
      <View style={styles.questionOverlay} />
      <Text style={styles.questionText}>{t(questionKey)}</Text>
    </TouchableOpacity>
  );

  const InitialView = () => {
    const [initialInput, setInitialInput] = useState('');
    return (
      <ScrollView style={styles.initialContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder={t('askAQuestion')}
            value={initialInput}
            onChangeText={setInitialInput}
            onSubmitEditing={() => { startChat(initialInput); setInitialInput(''); }}
            style={styles.input}
          />
          <View style={styles.inputButtons}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => { startChat(initialInput); setInitialInput(''); }}
            >
              {initialInput ? <SendIcon width={20} height={20} /> : <MicIcon width={20} height={20} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton}>
              <CameraIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionTitle}>{t('commonQuestions')}</Text>
        {commonQuestionsData.map(item => (
          <QuestionCard key={item.key} questionKey={item.key} imageUrl={item.imageUrl} />
        ))}
      </ScrollView>
    );
  };

  const ChatView = () => (
    <ScrollView ref={scrollRef} style={styles.chatContainer} contentContainerStyle={{ paddingBottom: 20 }}>
      {messages.map((msg, i) => (
        <View key={i} style={[styles.chatMessageWrapper, msg.sender === 'user' && styles.chatMessageUser]}>
          {msg.sender === 'bot' && <LogoIcon width={32} height={32} color="#16a34a" />}
          <View style={[styles.chatMessage, msg.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>{msg.text}</Text>
          </View>
        </View>
      ))}
      {isLoading && (
        <View style={styles.chatMessageWrapper}>
          <LogoIcon width={32} height={32} color="#16a34a" />
          <View style={[styles.chatMessage, styles.botMessage]}>
            <Text>...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => isChatting && setIsChatting(false)}>
          <ChevronLeftIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t('aiAdvisory')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>{isChatting ? <ChatView /> : <InitialView />}</View>
      {isChatting && (
        <View style={styles.chatInputWrapper}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSendFollowUp}
            placeholder={t('askMeAnything')}
            style={styles.chatInput}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={handleSendFollowUp} disabled={isLoading} style={styles.sendFollowUpButton}>
            <SendIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(240,253,244,0.5)' },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1 },
  initialContainer: { padding: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 16 },
  inputButtons: { flexDirection: 'row', position: 'absolute', right: 8, alignItems: 'center', gap: 4 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' },
  cameraButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#78716c', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' },
  questionCard: { height: 128, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  questionImage: { width: '100%', height: '100%' },
  questionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  questionText: { position: 'absolute', bottom: 16, left: 16, color: '#fff', fontWeight: 'bold', fontSize: 18 },
  chatContainer: { flex: 1, padding: 16 },
  chatMessageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  chatMessageUser: { justifyContent: 'flex-end' },
  chatMessage: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userMessage: { backgroundColor: '#16a34a', borderBottomRightRadius: 0 },
  botMessage: { backgroundColor: '#e5e7eb', borderBottomLeftRadius: 0 },
  userText: { color: '#fff' },
  botText: { color: '#1f2937' },
  chatInputWrapper: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#d1d5db', backgroundColor: '#fff' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16 },
  sendFollowUpButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }
});

export default AdvisoryScreen;
