import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from "react-native";
import { useState, useEffect } from "react";
import { Package, Plus, Edit2, Trash2, CheckCircle, XCircle, X, DollarSign, Image as ImageIcon } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

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

  const fetchItems = async () => {
    const { data, error } = await supabase.from("menu_items").select("*").order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      Alert.alert("Missing Info", "Please fill all required fields.");
      return;
    }

    const payload = { ...formData, price: Number(formData.price) };

    if (editingItem) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editingItem.id);
      if (!error) { Alert.alert("Updated", "Item updated successfully."); fetchItems(); setModalVisible(false); }
    } else {
      // For now, we manually provide cafeteria_id or link to the admin's canteen
      // We will handle cafeteria_id in Phase 6
      Alert.alert("Note", " cafeteria_id mapping is next.");
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
    fetchItems();
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background border-b border-white/5 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Inventory Hub</Text>
          <Text className="text-3xl font-black text-white tracking-tighter italic">Manage Menu</Text>
        </View>
        <TouchableOpacity 
          onPress={() => { setEditingItem(null); setFormData({ name: "", description: "", price: "", image_url: "", is_available: true }); setModalVisible(true); }}
          className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10 rotate-6"
        >
          <Plus size={28} color="#ff6b00" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="py-8">
          {items.map((item) => (
            <View key={item.id} className="mb-6 p-6 bg-card border border-white/5 rounded-[48px] flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
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
                <Text className="text-xl font-black text-white tracking-tight italic">{item.name}</Text>
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
                  className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-primary/10 shadow-inner"
                >
                  <Edit2 size={24} color="#ff6b00" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background p-8">
          <View className="flex-row justify-between items-center mb-10">
            <Text className="text-3xl font-black text-white tracking-tighter italic">
              {editingItem ? "Edit Entry" : "New Entry"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-primary/10 shadow-sm">
              <X size={24} color="#ff6b00" strokeWidth={2.5} />
            </TouchableOpacity>
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
              className="h-20 bg-primary rounded-3xl items-center justify-center mt-12 shadow-2xl shadow-primary/40"
            >
              <Text className="text-black font-black text-xl uppercase tracking-widest">Seal Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
