import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Modal } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Plus, Store, MapPin, X, Trash2, Edit2, Coffee, ArrowLeft } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

interface Cafeteria {
  id: string;
  name: string;
  location: string;
  image_url: string;
}

export default function CafeteriaManagement() {
  const router = useRouter();
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", image_url: "" });

  const fetchCafeterias = async () => {
    const { data, error } = await supabase.from("cafeterias").select("*").order("name", { ascending: true });
    if (!error && data) setCafeterias(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCafeterias();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.location) {
        Alert.alert("Error", "Please fill name and location.");
        return;
    }
    const { error } = await supabase.from("cafeterias").insert([formData]);
    if (!error) {
        Alert.alert("Success", "New canteen created!");
        setModalVisible(false);
        fetchCafeterias();
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-8 bg-background/80 backdrop-blur-xl border-b border-white/5 flex-row justify-between items-center">
        <View className="flex-row items-center gap-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/5"
          >
            <ArrowLeft size={24} color="#ff6b00" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">Global Network</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Canteens</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-2xl shadow-primary/30 rotate-6"
        >
          <Plus size={24} color="black" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchCafeterias();}} tintColor="#ff6b00" />}
      >
        <View className="py-8">
          {cafeterias.map((cafe) => (
            <View key={cafe.id} className="mb-4 p-6 bg-card border border-white/5 rounded-[32px] flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
               <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
               <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-xl shadow-primary/20 rotate-3 border border-primary/20">
                    <Store size={24} color="black" strokeWidth={2.5} />
               </View>
               <View className="flex-1 mr-2">
                  <Text className="text-xl font-black text-white tracking-tighter italic" numberOfLines={1}>{cafe.name}</Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <MapPin size={10} color="#ff6b00" />
                    <Text className="text-[9px] font-black text-gray-500 uppercase tracking-[2px] opacity-70" numberOfLines={1}>{cafe.location}</Text>
                  </View>
               </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Register Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background p-6">
            <View className="flex-row justify-between items-center mb-10">
                <Text className="text-3xl font-black text-white tracking-tighter italic">Register Unit</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/5">
                    <X size={24} color="#ff6b00" />
                </TouchableOpacity>
            </View>

            <View className="space-y-6">
                <View className="space-y-2">
                    <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] ml-1">Asset Identity</Text>
                    <TextInput 
                        className="h-16 bg-muted border border-white/5 rounded-2xl px-6 text-white font-black text-lg italic shadow-inner"
                        placeholder="e.g. Central Hall Cafeteria"
                        placeholderTextColor="#222"
                        onChangeText={(t) => setFormData({...formData, name: t})}
                    />
                </View>
                
                <View className="space-y-2">
                    <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] ml-1">Asset Coordinates</Text>
                    <TextInput 
                        className="h-16 bg-muted border border-white/5 rounded-2xl px-6 text-white font-black text-lg italic shadow-inner"
                        placeholder="e.g. Block A, 1st Floor"
                        placeholderTextColor="#222"
                        onChangeText={(t) => setFormData({...formData, location: t})}
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleCreate}
                    className="h-16 bg-primary rounded-2xl items-center justify-center mt-8 shadow-2xl shadow-primary/40"
                >
                    <Text className="text-black font-black text-lg uppercase tracking-widest">Deploy Unit</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}
