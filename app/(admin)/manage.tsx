import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from "react-native";
import { useState, useEffect } from "react";
import { Package, Plus, Edit2, Trash2, CheckCircle, XCircle, X, DollarSign, Image as ImageIcon, Camera, Upload, Loader2 } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { api } from "../../lib/api";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SkeletonPulse } from "../../components/SkeletonPulse";
import { GlassCard } from "../../components/GlassCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export default function ManageMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", image_url: "", is_available: true });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/menu");
      if (data) {
        const formatted = data.map((item: any) => ({
          ...item,
          id: item._id
        }));
        setItems(formatted);
      }
    } catch (error) {
      console.error("Menu fetch error:", error);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your gallery to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDiscard = () => {
    const hasChanges = formData.name || formData.description || formData.price || selectedImage;
    if (!hasChanges) {
      setModalVisible(false);
      setSelectedImage(null);
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm("Discard changes? All unsaved data will be lost.")) {
        setModalVisible(false);
        setSelectedImage(null);
      }
      return;
    }

    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => {
          setModalVisible(false);
          setSelectedImage(null);
        }}
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      if (Platform.OS === 'web') {
        alert("Please fill all required fields (Name, Price, Description).");
      } else {
        Alert.alert("Missing Info", "Please fill all required fields.");
      }
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('is_available', String(formData.is_available));

    if (selectedImage) {
      const uri = selectedImage;
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : `image/jpeg`;
      
      data.append('image', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type,
      } as any);
    }

    try {
      console.log(`[Manage] Saving... Editing: ${!!editingItem}`);
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (Platform.OS === 'web') alert("Item updated successfully.");
        else Alert.alert("Updated", "Item updated successfully.");
      } else {
        await api.post("/menu", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (Platform.OS === 'web') alert("New item created!");
        else Alert.alert("Success", "New item created!");
      }
      
      await fetchItems();
      setModalVisible(false);
      setSelectedImage(null);
      setFormData({ name: "", description: "", price: "", image_url: "", is_available: true });
    } catch (error: any) {
      console.error("[Manage] Save error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || error.message;
      if (Platform.OS === 'web') alert(`Error: ${msg}`);
      else Alert.alert("Error", msg);
    } finally {
      setUploading(false);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.put(`/menu/${id}`, { is_available: !current });
      fetchItems();
    } catch (error) {
      console.error("Availability toggle error:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <BlurView intensity={80} tint="dark" className="px-6 pt-16 pb-8 border-b border-white/5 flex-row justify-between items-center z-10">
        <View>
          <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Inventory Hub</Text>
          <Text className="text-3xl font-black text-white tracking-tighter italic">Manage Menu</Text>
        </View>
        <TouchableOpacity 
          onPress={() => { setEditingItem(null); setFormData({ name: "", description: "", price: "", image_url: "", is_available: true }); setSelectedImage(null); setModalVisible(true); }}
          className="w-12 h-12 rounded-2xl bg-primary items-center justify-center border border-primary/20 shadow-2xl shadow-primary/40 rotate-6"
        >
          <Plus size={28} color="black" strokeWidth={3} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView className="flex-1 px-4">
        <View className="py-8">
          {loading ? (
            [1, 2, 3].map((i) => (
              <View key={i} className="mb-6 p-6 bg-white/5 rounded-[48px] flex-row gap-6 items-center">
                 <SkeletonPulse width={80} height={80} borderRadius={24} />
                 <View className="flex-1 gap-3">
                    <SkeletonPulse width="60%" height={20} />
                    <SkeletonPulse width="40%" height={14} />
                 </View>
              </View>
            ))
          ) : (
            items.map((item, index) => (
              <Animated.View 
                entering={FadeInDown.delay(index * 100).springify()}
                key={item.id} 
                className="mb-6"
              >
                <GlassCard containerStyle={{ borderRadius: 48 }}>
                  <View className="flex-row gap-6 items-center relative overflow-hidden">
                    <View className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                    <View className="w-20 h-20 rounded-3xl bg-white/5 shadow-inner overflow-hidden border border-white/5">
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} className="w-full h-full" />
                      ) : (
                        <View className="w-full h-full items-center justify-center opacity-20">
                          <Package size={28} color="#ff6b00" strokeWidth={2.5} />
                        </View>
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-xl font-black text-white tracking-tight italic" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-primary font-black text-xs tracking-widest uppercase mt-1">Rs. {item.price}</Text>
                    </View>

                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        onPress={() => toggleAvailability(item.id, item.is_available)}
                        className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm ${item.is_available ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}
                      >
                        <CheckCircle size={24} color={item.is_available ? "#22c55e" : "#ef4444"} strokeWidth={2.5} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => { setEditingItem(item); setFormData({ ...item, price: String(item.price) }); setModalVisible(true); }}
                        className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-inner"
                      >
                        <Edit2 size={24} color="#ff6b00" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-8">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-3xl font-black text-white tracking-tighter italic">
                  {editingItem ? "Edit Entry" : "New Entry"}
                </Text>
                <TouchableOpacity onPress={handleDiscard} className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-primary/10 shadow-sm">
                  <X size={24} color="#ff6b00" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Image Picker Section */}
              <View className="items-center mb-10">
                 <View className="w-40 h-40 rounded-[48px] bg-muted border border-white/5 overflow-hidden shadow-2xl relative">
                    {(selectedImage || formData.image_url) ? (
                       <Image source={{ uri: selectedImage || formData.image_url }} className="w-full h-full" />
                    ) : (
                       <View className="w-full h-full items-center justify-center">
                          <ImageIcon size={48} color="#222" strokeWidth={1} />
                       </View>
                    )}
                    {selectedImage && (
                       <View className="absolute top-2 right-2 bg-primary rounded-full p-1 border-2 border-background">
                          <CheckCircle size={14} color="black" strokeWidth={3} />
                       </View>
                    )}
                 </View>
                 
                 <View className="flex-row gap-4 mt-6">
                    <TouchableOpacity 
                      onPress={takePhoto}
                      className="flex-row items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shadow-sm"
                    >
                      <Camera size={18} color="#ff6b00" strokeWidth={2.5} />
                      <Text className="text-white font-black text-[10px] uppercase tracking-widest italic">Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={pickImage}
                      className="flex-row items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shadow-sm"
                    >
                      <Upload size={18} color="#ff6b00" strokeWidth={2.5} />
                      <Text className="text-white font-black text-[10px] uppercase tracking-widest italic">Gallery</Text>
                    </TouchableOpacity>
                 </View>
              </View>

              <View className="space-y-8">
                <View className="space-y-3">
                  <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] ml-1">Identity</Text>
                  <TextInput 
                    className="h-20 bg-muted border border-white/5 rounded-3xl px-8 text-white font-black text-xl italic shadow-inner"
                    placeholder="e.g. Masala Tea"
                    placeholderTextColor="#444"
                    onChangeText={(t) => setFormData({...formData, name: t})}
                    value={formData.name}
                  />
                </View>

                <View className="space-y-3">
                  <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] ml-1">Intel</Text>
                  <TextInput 
                    className="h-20 bg-muted border border-white/5 rounded-3xl px-8 text-white font-black text-xl italic shadow-inner"
                    placeholder="Delicious hand-made tea"
                    placeholderTextColor="#444"
                    onChangeText={(t) => setFormData({...formData, description: t})}
                    value={formData.description}
                  />
                </View>

                <View className="space-y-3">
                  <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] ml-1">Credits (Rs.)</Text>
                  <TextInput 
                    className="h-16 bg-muted border border-white/5 rounded-3xl px-8 text-white font-black text-2xl italic shadow-inner"
                    placeholder="50"
                    placeholderTextColor="#444"
                    keyboardType="numeric"
                    onChangeText={(t) => setFormData({...formData, price: t})}
                    value={formData.price}
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={uploading}
                  className={`h-20 bg-primary rounded-[32px] items-center justify-center mt-12 shadow-2xl shadow-primary/40 flex-row gap-4 ${uploading ? "opacity-50" : ""}`}
                >
                   {uploading ? (
                      <Loader2 size={24} color="black" className="animate-spin" />
                   ) : (
                     <>
                      <Text className="text-black font-black text-xl uppercase tracking-widest italic">{editingItem ? "Update dish" : "Add to menu"}</Text>
                      <CheckCircle size={24} color="black" strokeWidth={3} />
                     </>
                   )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleDiscard}
                  className="mt-4 pb-12 items-center"
                >
                   <Text className="text-gray-500 font-black text-[10px] uppercase tracking-[3px]">Discard Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
