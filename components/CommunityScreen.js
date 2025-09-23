import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// --- Timeline formatter ---
const getTimeAgo = (date) => {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// --- Example Community Posts ---
const communityPosts = [
  {
    id: '1',
    name: 'Ramprasad Sharma',
    location: 'Jaipur Village',
    createdAt: new Date(Date.now() - 7200000), // 2h ago
    avatarUrl: 'https://imgs.search.brave.com/cN5coxVTrA1ZNN-EdMAyXlU6BJSo_gJ721OkKdu6VVg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by95b3VuZy1pbmRp/YW4tZmFybWVyLXN0/YW5kaW5nLWNvdHRv/bi1hZ3JpY3VsdHVy/ZS1maWVsZF83NTY0/OC02OTU5LmpwZz9z/ZW10PWFpc19pbmNv/bWluZyZ3PTc0MCZx/PTgw',
    text:
      'My chili crop is showing yellowing leaves. Is it nutrient deficiency or something else? Any advice appreciated!',
  },
  {
    id: '2',
    name: 'Priya Devi',
    location: 'Ganga Nagar',
    createdAt: new Date(Date.now() - 18000000), // 5h ago
    avatarUrl: 'https://imgs.search.brave.com/VRAUefkQTIBRb7GpZYJt2fFbfKQ_cPGP62wDqIas6Ck/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by95b3VuZy1pbmRp/YW4tZmFybWVyLXN0/YW5kaW5nLWNvdHRv/bi1hZ3JpY3VsdHVy/ZS1maWVsZF81NDM5/MS01OTk4LmpwZz9z/ZW10PWFpc19pbmNv/bWluZyZ3PTc0MCZx/PTgw',
    text: 'Found a great way to make organic pesticide using neem oil. Will share the recipe soon!',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
];

// --- Example Government Posts ---
const govtPosts = [
  {
    id: '3',
    name: 'Meena Kumari',
    location: 'Haripur',
    createdAt: new Date(Date.now() - 172800000), // 2 days
    avatarUrl: 'https://i.imgur.com/tH2sX16.png',
    text: 'Our recent harvest of wheat was excellent! Thanks to the AI advisory for timely pest control tips.',
  },
  {
    id: '4',
    name: 'Anil Kumar',
    location: 'Shivpur Kalan',
    createdAt: new Date(Date.now() - 86400000), // 1 day
    avatarUrl: 'https://i.imgur.com/3Z4Y5Zp.png',
    text: 'Planning to switch to drip irrigation next season. Has anyone had good results with it in this region?',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
];

// --- Post Card ---
const PostCard = ({ post, onOpen }) => {
  const hasMedia = !!post.image || !!post.video;
  return (
    <TouchableOpacity
      activeOpacity={hasMedia ? 0.9 : 1}
      style={styles.postCard}
      onPress={() => {
        if (hasMedia && onOpen) onOpen(post);
      }}
    >
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.postName}>{post.name}</Text>
          <Text style={styles.postLoc}>{post.location}</Text>
        </View>
        <Text style={styles.postTime}>{getTimeAgo(new Date(post.createdAt))}</Text>
      </View>
      {post.text && <Text style={styles.postText}>{post.text}</Text>}
      {post.image && <Image source={{ uri: post.image }} style={styles.media} />}
      {post.video && !post.image && (
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoIcon}>▶</Text>
          <Text style={styles.videoText}>Video Attached</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState('Community');
  const [isModalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState(communityPosts); // reset to examples
  const [govtData] = useState(govtPosts);

  const [newText, setNewText] = useState('');
  const [newMedia, setNewMedia] = useState({});

  // viewer modal state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerMedia, setViewerMedia] = useState({ uri: null, type: null });

  // pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setNewMedia({ image: result.assets[0].uri });
    }
  };

  // pick video
  const pickVideo = async (short = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
      videoMaxDuration: short ? 15 : 0,
    });
    if (!result.canceled) {
      setNewMedia({ video: result.assets[0].uri });
    }
  };

  // add new post (only community)
  const addNewPost = () => {
    if (!newText.trim() && !newMedia.image && !newMedia.video) {
      setModalVisible(false);
      return;
    }
    const newPost = {
      id: String(Date.now()),
      name: 'You',
      location: 'My Village',
      createdAt: new Date(),
      avatarUrl: 'https://i.imgur.com/3Z4Y5Zp.png',
      text: newText,
      ...newMedia,
    };
    setPosts([newPost, ...posts]);
    setNewText('');
    setNewMedia({});
    setModalVisible(false);
  };

  // open post media
  const openPostMedia = (post) => {
    if (post.image) {
      setViewerMedia({ uri: post.image, type: 'image' });
      setViewerVisible(true);
    } else if (post.video) {
      setViewerMedia({ uri: post.video, type: 'video' });
      setViewerVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community & Govt Connect</Text>
      </View>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'Community' && styles.activeToggle]}
          onPress={() => setActiveTab('Community')}
        >
          <Text style={[styles.toggleText, activeTab === 'Community' && styles.activeToggleText]}>
            Community
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'Government' && styles.activeToggle]}
          onPress={() => setActiveTab('Government')}
        >
          <Text style={[styles.toggleText, activeTab === 'Government' && styles.activeToggleText]}>
            Government
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts */}
      <FlatList
        data={activeTab === 'Community' ? posts : govtData}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4 }}
        renderItem={({ item }) => <PostCard post={item} onOpen={openPostMedia} />}
      />

      {/* FAB */}
      {activeTab === 'Community' && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Create Post Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create a Post</Text>

            <TextInput
              style={styles.inputBox}
              placeholder="Share your thoughts..."
              value={newText}
              onChangeText={setNewText}
              multiline
            />

            {/* --- Preview with remove button --- */}
            {newMedia.image && (
              <View style={{ marginBottom: 16 }}>
                <Image source={{ uri: newMedia.image }} style={styles.previewMedia} />
                <TouchableOpacity onPress={() => setNewMedia({})} style={styles.removePreviewBtn}>
                  <Text style={styles.removePreviewText}>✖ Remove Image</Text>
                </TouchableOpacity>
              </View>
            )}

            {newMedia.video && (
              <View style={{ marginBottom: 16 }}>
                <View style={[styles.previewMedia, { backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 24 }}>🎥</Text>
                  <Text style={{ marginTop: 8, color: '#475569' }}>Video Selected</Text>
                </View>
                <TouchableOpacity onPress={() => setNewMedia({})} style={styles.removePreviewBtn}>
                  <Text style={styles.removePreviewText}>✖ Remove Video</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Upload buttons */}
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                <Text style={styles.uploadBoxText}>🖼 Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBox} onPress={() => pickVideo(false)}>
                <Text style={styles.uploadBoxText}>🎥 Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBox} onPress={() => pickVideo(true)}>
                <Text style={styles.uploadBoxText}>📹 Short</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postButton} onPress={addNewPost}>
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Viewer Modal */}
      <Modal visible={viewerVisible} animationType="fade" transparent={false}>
        <View style={styles.viewerContainer}>
          <View style={styles.viewerTop}>
            <TouchableOpacity onPress={() => setViewerVisible(false)}>
              <Text style={styles.viewerCloseText}>Close</Text>
            </TouchableOpacity>
          </View>

          {viewerMedia.type === 'image' && (
            <Image source={{ uri: viewerMedia.uri }} style={styles.viewerMedia} resizeMode="contain" />
          )}

          {viewerMedia.type === 'video' && (
            <View style={[styles.viewerMedia, { backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 48, color: '#fff' }}>🎥</Text>
              <Text style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>Video Preview</Text>
              <Text style={{ color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                Video playback requires expo-av package
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1e293b' },

  toggleRow: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  activeToggle: { backgroundColor: '#fff', elevation: 2 },
  toggleText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  activeToggleText: { color: '#16a34a' },

  postCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  postName: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  postLoc: { fontSize: 13, color: '#64748b' },
  postTime: { fontSize: 13, color: '#94a3b8', marginLeft: 'auto' },
  postText: { marginTop: 4, fontSize: 15, lineHeight: 22, color: '#334155' },
  media: { width: '100%', height: 200, borderRadius: 10, marginTop: 12 },
  videoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  videoIcon: { fontSize: 18, marginRight: 8 },
  videoText: { color: '#475569', fontWeight: '500' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#16a34a',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  fabIcon: { color: '#fff', fontSize: 32, fontWeight: '300' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1e293b' },
  inputBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  previewMedia: { width: '100%', height: 200, borderRadius: 10, marginBottom: 8 },

  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  uploadBox: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  uploadBoxText: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 14,
  },

  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  cancelText: { color: '#64748b', fontWeight: '600', paddingHorizontal: 16, paddingVertical: 8 },
  postButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // remove preview
  removePreviewBtn: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removePreviewText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 13,
  },

  // viewer modal
  viewerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  viewerTop: { width: '100%', padding: 16, alignItems: 'flex-end' },
  viewerCloseText: { color: '#fff', fontSize: 16 },
  viewerMedia: { width: '100%', height: '85%' },
});