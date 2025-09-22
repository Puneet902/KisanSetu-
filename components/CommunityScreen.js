import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';

const mockPosts = [
	{ id: '1', name: 'Ramprasad Sharma', location: 'Jaipur Village', time: '2 hours ago', avatarUrl: 'https://i.imgur.com/3Z4Y5Zp.png', text: 'My chili crop is showing yellowing leaves. Is it nutrient deficiency or something else? Any advice appreciated!' },
	{ id: '2', name: 'Priya Devi', location: 'Ganga Nagar', time: '5 hours ago', avatarUrl: 'https://i.imgur.com/8s46J8K.png', text: 'Found a great way to make organic pesticide using neem oil. Will share the recipe soon!', audio: { duration: '0:45' } },
	{ id: '3', name: 'Anil Kumar', location: 'Shivpur Kalan', time: '1 day ago', avatarUrl: 'https://i.imgur.com/dlvyA6r.png', text: 'Planning to switch to drip irrigation next season. Has anyone had good results with it in this region?', audio: { duration: '1:10' } },
	{ id: '4', name: 'Meena Kumari', location: 'Haripur', time: '2 days ago', avatarUrl: 'https://i.imgur.com/tH2sX16.png', text: 'Our recent harvest of wheat was excellent! Thanks to the AI advisory for timely pest control tips.' }
];

const AudioPlayer = ({ duration }) => (
	<View style={styles.audioRow}>
		<TouchableOpacity>
			<Text>▶️</Text>
		</TouchableOpacity>
		<View style={styles.audioBar} />
		<Text style={styles.audioDuration}>{duration}</Text>
	</View>
);

const PostCard = ({ post }) => (
	<View style={styles.postCard}>
		<View style={styles.postHeader}>
			<Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
			<View style={{ flex: 1 }}>
				<Text style={styles.postName}>{post.name}</Text>
				<Text style={styles.postLoc}>{post.location}</Text>
			</View>
			<Text style={styles.postTime}>{post.time}</Text>
		</View>
		<Text style={styles.postText}>{post.text}</Text>
		{post.audio && <AudioPlayer duration={post.audio.duration} />}
	</View>
);

export default function CommunityScreen() {
	const { t } = useLocalization();

	return (
		<View style={{ flex: 1, backgroundColor: '#ecfdf5' }}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{t('communityAndGovtConnect') || 'Community'}</Text>
			</View>
			<FlatList data={mockPosts} keyExtractor={i => i.id} contentContainerStyle={{ padding: 12 }} renderItem={({ item }) => <PostCard post={item} />} />
			<TouchableOpacity style={styles.fab}><Text style={{ color: '#fff' }}>＋</Text></TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { padding: 12, backgroundColor: '#ecfdf5', borderBottomWidth: 1, borderColor: '#e6f0ea' },
	headerTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
	postCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
	postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
	postName: { fontWeight: '700' },
	postLoc: { fontSize: 12, color: '#666' },
	postTime: { fontSize: 12, color: '#999' },
	postText: { marginTop: 8, color: '#333' },
	audioRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
	audioBar: { flex: 1, height: 6, backgroundColor: '#e6f0ea', marginHorizontal: 8, borderRadius: 4 },
	audioDuration: { fontFamily: 'monospace', color: '#666' },
	fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#16a34a', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }
});
