import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Modal } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Plus, Store, MapPin, X, Trash2, Edit2, Coffee, ArrowLeft, Mail, Heart } from "lucide-react-native";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/GlassCard";

interface Cafeteria {
  id: string;
  name: string;
  location: string;
  image_url: string;
  adminEmail: string;
}

export default function CafeteriaManagement() {
  const router = useRouter();
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", adminEmail: "", image_url: "" });

  const fetchCafeterias = async () => {
    try {
      const { data } = await api.get("/cafeterias");
      if (data) {
        const formatted = data.map((c: any) => ({
          ...c,
          id: c._id
        }));
        setCafeterias(formatted);
      }
    } catch (error) {
      console.error("Cafeterias fetch error:", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCafeterias();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.location || !formData.adminEmail) {
        Alert.alert("Oops!", "Please make sure to fill in the canteen name, location, and the manager's email so we can hook them up!");
        return;
    }
    try {
      await api.post("/cafeterias", formData);
      Alert.alert("Yay! 🎉", "Your new canteen is officially on the map!");
      setModalVisible(false);
      setFormData({ name: "", location: "", adminEmail: "", image_url: "" });
      fetchCafeterias();
    } catch (error: any) {
      Alert.alert("Something went wrong", error.response?.data?.message || "We couldn't set up the canteen just yet.");
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
            <Text className="text-[10px] font-black text-primary uppercase tracking-[3px]">CanteenGo Family</Text>
            <Text className="text-3xl font-black text-white tracking-tighter italic">Our Canteens</Text>
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
            <View key={cafe.id} className="mb-4">
              <GlassCard containerStyle={{ borderRadius: 32, padding: 24 }}>
                <View className="flex-row items-center gap-6 relative overflow-hidden">
                  <View className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                  <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-xl shadow-primary/20 rotate-3 border border-primary/20">
                        <Store size={24} color="black" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                      <Text className="text-xl font-black text-white tracking-tighter italic" numberOfLines={1}>{cafe.name}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <MapPin size={10} color="#ff6b00" />
                        <Text className="text-[9px] font-black text-gray-500 uppercase tracking-[2px]" numberOfLines={1}>{cafe.location}</Text>
                      </View>
                      <View className="flex-row items-center gap-2 mt-2">
                        <Mail size={10} color="#444" />
                        <Text className="text-[9px] font-bold text-gray-600 italic" numberOfLines={1}>{cafe.adminEmail || "No manager yet"}</Text>
                      </View>
                  </View>
                </View>
              </GlassCard>
            </View>
          ))}

          {cafeterias.length === 0 && !loading && (
             <View className="py-20 items-center justify-center opacity-30">
                <Heart size={64} color="#ff6b00" strokeWidth={1} />
                <Text className="text-white font-black text-xl mt-6 italic">No canteens yet. Let's build some!</Text>
             </View>
          )}
        </View>
      </ScrollView>

      {/* Register Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background p-8">
            <View className="flex-row justify-between items-center mb-10">
                <Text className="text-3xl font-black text-white tracking-tighter italic">New Canteen ✨</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/5">
                    <X size={24} color="#ff6b00" />
                </TouchableOpacity>
            </View>

            <View className="space-y-8">
                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">What's the name?</Text>
                    <TextInput 
                        className="h-16 bg-card border border-white/5 rounded-2xl px-6 text-white font-black text-lg italic shadow-inner"
                        placeholder="e.g. Sunny Meals"
                        placeholderTextColor="#333"
                        onChangeText={(t) => setFormData({...formData, name: t})}
                        value={formData.name}
                    />
                </View>
                
                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">Where's it located?</Text>
                    <TextInput 
                        className="h-16 bg-card border border-white/5 rounded-2xl px-6 text-white font-black text-lg italic shadow-inner"
                        placeholder="e.g. Near the Library"
                        placeholderTextColor="#333"
                        onChangeText={(t) => setFormData({...formData, location: t})}
                        value={formData.location}
                    />
                </View>

                <View>
                    <Text className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] ml-1 mb-2">Who's managing it? (Email)</Text>
                    <TextInput 
                        className="h-16 bg-card border border-white/5 rounded-2xl px-6 text-white font-black text-lg italic shadow-inner"
                        placeholder="manager@email.com"
                        placeholderTextColor="#333"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(t) => setFormData({...formData, adminEmail: t})}
                        value={formData.adminEmail}
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleCreate}
                    className="h-20 bg-primary rounded-[32px] items-center justify-center mt-12 shadow-2xl shadow-primary/40 flex-row gap-4"
                >
                    <Text className="text-black font-black text-xl italic tracking-tighter uppercase">Bring it to life!</Text>
                    <Heart size={20} color="black" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}
