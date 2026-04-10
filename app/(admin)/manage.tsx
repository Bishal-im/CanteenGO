import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from "react-native";
import { useState, useEffect } from "react";
import { Package, Plus, Edit2, Trash2, CheckCircle, XCircle, X, DollarSign, Image as ImageIcon, Camera, Upload, Loader2, Tag, ChevronDown } from "lucide-react-native";
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
  category: string;
}

export default function ManageMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", image_url: "", is_available: true, category: "" });
  const [newCat, setNewCat] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get("/menu"),
        api.get("/cafeterias/my/categories")
      ]);
      
      if (menuRes.data) {
        setItems(menuRes.data.map((item: any) => ({ ...item, id: item._id })));
      }
      if (catRes.data) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCategories = async (updated: string[]) => {
    try {
      await api.put("/cafeterias/my/categories", { categories: updated });
      setCategories(updated);
    } catch (error) {
      Alert.alert("Error", "Failed to update categories");
    }
  };

  const addCategory = () => {
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) {
        Alert.alert("Error", "Category already exists");
        return;
    }
    handleSaveCategories([...categories, newCat.trim()]);
    setNewCat("");
  };

  const deleteCategory = (cat: string) => {
    handleSaveCategories(categories.filter(c => c !== cat));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const handleDiscard = () => {
    const hasChanges = formData.name || selectedImage;
    if (!hasChanges) {
      setModalVisible(false);
      setSelectedImage(null);
      return;
    }
    Alert.alert("Discard Changes", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => { setModalVisible(false); setSelectedImage(null); }}
    ]);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert("Missing Info", "Please fill Name, Price, and Category.");
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('is_available', String(formData.is_available));

    if (selectedImage) {
      const uri = selectedImage;
      const filename = uri.split('/').pop() || 'image.jpg';
      const type = `image/${filename.split('.').pop() === 'jpg' ? 'jpeg' : filename.split('.').pop()}`;
      data.append('image', { uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, name: filename, type } as any);
    }

    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post("/menu", data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await fetchData();
      setModalVisible(false);
      setSelectedImage(null);
      setFormData({ name: "", description: "", price: "", image_url: "", is_available: true, category: "" });
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to save item");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await api.delete(`/menu/${id}`);
          fetchData();
        } catch (error) { console.error(error); }
      }}
    ]);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.put(`/menu/${id}`, { is_available: !current });
      fetchData();
    } catch (error) { console.error(error); }
  };

  return (
    <View className="flex-1 bg-background">
      <BlurView intensity={80} tint="dark" className="px-6 pt-16 pb-8 border-b border-white/5 flex-row justify-between items-center z-10">
        <View>
          <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Inventory Hub</Text>
          <Text className="text-3xl font-black text-white tracking-tighter italic">Manage Menu</Text>
        </View>
        <View className="flex-row gap-3">
            <TouchableOpacity 
                onPress={() => setCatModalVisible(true)}
                className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/10"
            >
                <Tag size={20} color="#ff6b00" />
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => { setEditingItem(null); setFormData({ name: "", description: "", price: "", image_url: "", is_available: true, category: categories[0] || "" }); setSelectedImage(null); setModalVisible(true); }}
                className="w-12 h-12 rounded-2xl bg-primary items-center justify-center border border-primary/20 shadow-2xl shadow-primary/40 rotate-6"
            >
                <Plus size={28} color="black" strokeWidth={3} />
            </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView className="flex-1 px-4">
        <View className="py-8">
          {loading ? (
             [1,2,3].map(i => <View key={i} className="mb-6 p-6 bg-white/5 rounded-[48px] h-24 mb-4" />)
          ) : (
            items.map((item, index) => (
              <Animated.View entering={FadeInDown.delay(index * 100).springify()} key={item.id} className="mb-6">
                <GlassCard containerStyle={{ borderRadius: 48 }}>
                  <View className="flex-row gap-6 items-center relative overflow-hidden">
                    <View className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
                    <View className="w-20 h-20 rounded-3xl bg-white/5 shadow-inner overflow-hidden border border-white/5">
                      {item.image_url ? <Image source={{ uri: item.image_url }} className="w-full h-full" /> : <Package size={28} color="#ff6b00" strokeWidth={2.5} className="opacity-20 m-auto" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl font-black text-white tracking-tight italic" numberOfLines={1}>{item.name}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                          <Text className="text-primary font-black text-xs uppercase">Rs. {item.price}</Text>
                          <View className="w-1 h-1 rounded-full bg-white/20" />
                          <Text className="text-gray-500 font-bold text-[9px] uppercase tracking-widest">{item.category}</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => toggleAvailability(item.id, item.is_available)} className={`w-10 h-10 rounded-xl items-center justify-center ${item.is_available ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                        <CheckCircle size={20} color={item.is_available ? "#22c55e" : "#ef4444"} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingItem(item); setFormData({ ...item, price: String(item.price) }); setModalVisible(true); }} className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10">
                        <Edit2 size={20} color="#ff6b00" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/20">
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Main Form Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <ScrollView className="p-8">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-3xl font-black text-white italic">{editingItem ? "Edit Entry" : "New Entry"}</Text>
              <TouchableOpacity onPress={handleDiscard} className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center"><X size={24} color="#ff6b00" /></TouchableOpacity>
            </View>

            <View className="items-center mb-10">
                <TouchableOpacity onPress={pickImage} className="w-40 h-40 rounded-[48px] bg-muted border border-white/5 overflow-hidden shadow-2xl">
                    {(selectedImage || formData.image_url) ? <Image source={{ uri: selectedImage || formData.image_url }} className="w-full h-full" /> : <ImageIcon size={48} color="#222" className="m-auto" />}
                </TouchableOpacity>
                <View className="flex-row gap-4 mt-6">
                    <TouchableOpacity onPress={takePhoto} className="flex-row items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10"><Camera size={16} color="#ff6b00" /><Text className="text-white text-[10px] uppercase font-black">Camera</Text></TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} className="flex-row items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10"><Upload size={16} color="#ff6b00" /><Text className="text-white text-[10px] uppercase font-black">Gallery</Text></TouchableOpacity>
                </View>
            </View>

            <View className="gap-6">
                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">Item Name</Text>
                    <TextInput className="h-16 bg-muted border border-white/5 rounded-2xl px-6 text-white font-black text-lg italic" placeholder="e.g. Garlic Naan" placeholderTextColor="#444" onChangeText={t => setFormData({...formData, name: t})} value={formData.name} />
                </View>
                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">Price (Rs.)</Text>
                    <TextInput className="h-16 bg-muted border border-white/5 rounded-2xl px-6 text-white font-black text-xl italic" placeholder="100" placeholderTextColor="#444" keyboardType="numeric" onChangeText={t => setFormData({...formData, price: t})} value={formData.price} />
                </View>
                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-2">
                        {categories.map(cat => (
                            <TouchableOpacity key={cat} onPress={() => setFormData({...formData, category: cat})} className={`px-5 py-3 rounded-xl mr-3 border ${formData.category === cat ? "bg-primary border-primary" : "bg-white/5 border-white/10"}`}>
                                <Text className={`font-black uppercase text-[10px] tracking-widest ${formData.category === cat ? "text-black" : "text-gray-400"}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">Description</Text>
                    <TextInput className="h-24 bg-muted border border-white/5 rounded-2xl px-6 text-white font-medium text-sm" placeholder="Tell us about this dish..." placeholderTextColor="#444" multiline onChangeText={t => setFormData({...formData, description: t})} value={formData.description} />
                </View>

                <TouchableOpacity onPress={handleSave} disabled={uploading} className="h-20 bg-primary rounded-[32px] items-center justify-center mt-6 flex-row gap-4">
                    {uploading ? <Loader2 size={24} color="black" className="animate-spin" /> : <>
                        <Text className="text-black font-black text-lg uppercase italic">{editingItem ? "Update Dish" : "Add to Menu"}</Text>
                        <CheckCircle size={20} color="black" strokeWidth={3} />
                    </>}
                </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Category Management Modal */}
      <Modal visible={catModalVisible} animationType="fade" transparent>
          <View className="flex-1 bg-black/80 items-center justify-center p-6">
              <View className="w-full bg-muted border border-white/10 rounded-[48px] p-8 max-h-[70%]">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-black text-white italic">Categories</Text>
                    <TouchableOpacity onPress={() => setCatModalVisible(false)}><X size={20} color="#ff6b00" /></TouchableOpacity>
                </View>
                
                <View className="flex-row gap-3 mb-8">
                    <TextInput className="flex-1 h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-white font-bold" placeholder="New category..." placeholderTextColor="#444" value={newCat} onChangeText={setNewCat} />
                    <TouchableOpacity onPress={addCategory} className="w-12 h-12 bg-primary rounded-xl items-center justify-center"><Plus size={20} color="black" /></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {categories.map(cat => (
                        <View key={cat} className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/5">
                            <Text className="text-white font-black uppercase text-[10px] tracking-widest">{cat}</Text>
                            <TouchableOpacity onPress={() => deleteCategory(cat)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
              </View>
          </View>
      </Modal>
    </View>
  );
}
