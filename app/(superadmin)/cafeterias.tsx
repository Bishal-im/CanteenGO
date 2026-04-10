import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Modal, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Plus, Store, MapPin, X, Trash2, Edit2, Coffee, ArrowLeft, Mail, Heart, AlertTriangle, Check } from "lucide-react-native";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/GlassCard";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut, ScaleInCenter, ScaleOutCenter } from "react-native-reanimated";

interface Cafeteria {
  id: string;
  name: string;
  location: string;
  adminEmail: string;
  image_url?: string;
}

export default function CafeteriaManagement() {
  const router = useRouter();
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Cafeteria | null>(null);
  
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

  const resetForm = () => {
    setFormData({ name: "", location: "", adminEmail: "", image_url: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.location || !formData.adminEmail) {
        Alert.alert("Oops!", "Please make sure to fill in the canteen name, location, and the manager's email!");
        return;
    }
    
    setActionLoading(true);
    try {
      if (isEditing && editingId) {
        await api.put(`/cafeterias/${editingId}`, formData);
        Alert.alert("Updated! ✨", "Canteen details have been successfully refreshed.");
      } else {
        await api.post("/cafeterias", formData);
        Alert.alert("Yay! 🎉", "Your new canteen is officially on the map!");
      }
      setModalVisible(false);
      resetForm();
      fetchCafeterias();
    } catch (error: any) {
      Alert.alert("Something went wrong", error.response?.data?.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const initiateDelete = (item: Cafeteria) => {
    setItemToDelete(item);
    setConfirmVisible(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setActionLoading(true);
    try {
        await api.delete(`/cafeterias/${itemToDelete.id}`);
        setConfirmVisible(false);
        setItemToDelete(null);
        fetchCafeterias();
    } catch (error: any) {
        Alert.alert("Error", "Could not remove this canteen.");
    } finally {
        setActionLoading(false);
    }
  };

  const initiateEdit = (item: Cafeteria) => {
    setFormData({
        name: item.name,
        location: item.location,
        adminEmail: item.adminEmail,
        image_url: item.image_url || ""
    });
    setEditingId(item.id);
    setIsEditing(true);
    setModalVisible(true);
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
          onPress={() => { resetForm(); setModalVisible(true); }}
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
                  
                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      onPress={() => initiateEdit(cafe)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
                    >
                        <Edit2 size={16} color="#3b82f6" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => initiateDelete(cafe)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 items-center justify-center"
                    >
                        <Trash2 size={16} color="#ef4444" strokeWidth={2.5} />
                    </TouchableOpacity>
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

      {/* Register/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background p-8">
            <View className="flex-row justify-between items-center mb-10">
                <Text className="text-3xl font-black text-white tracking-tighter italic">
                    {isEditing ? "Modify Unit ✨" : "New Canteen ✨"}
                </Text>
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
                    onPress={handleCreateOrUpdate}
                    disabled={actionLoading}
                    className="h-20 bg-primary rounded-[32px] items-center justify-center mt-12 shadow-2xl shadow-primary/40 flex-row gap-4"
                >
                    {actionLoading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <>
                            <Text className="text-black font-black text-xl italic tracking-tighter uppercase font-black">
                                {isEditing ? "Update Unit" : "Bring it to life!"}
                            </Text>
                            <Heart size={20} color="black" strokeWidth={3} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Custom Global Confirmation Modal */}
      {confirmVisible && (
          <View className="absolute inset-0 z-[100] items-center justify-center px-8">
              <Animated.View 
                entering={FadeIn}
                exiting={FadeOut}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <Animated.View 
                entering={ScaleInCenter}
                exiting={ScaleOutCenter}
                className="w-full"
              >
                  <GlassCard containerStyle={{ borderRadius: 40, padding: 32, borderWidth: 1, borderColor: '#ef444430' }}>
                      <View className="items-center">
                          <View className="w-20 h-20 rounded-3xl bg-red-500/10 items-center justify-center mb-6 border border-red-500/20 rotate-3">
                              <AlertTriangle size={40} color="#ef4444" strokeWidth={2.5} />
                          </View>
                          <Text className="text-3xl font-black text-white text-center leading-9 italic tracking-tighter mb-4">
                              Remove from Grid?
                          </Text>
                          <Text className="text-gray-400 text-center font-bold px-4 mb-10 leading-6 uppercase tracking-[1px] text-[10px]">
                              Are you sure you want to shut down "{itemToDelete?.name}"? All associated data will be archived.
                          </Text>
                          
                          <View className="flex-row gap-4 w-full">
                              <TouchableOpacity 
                                onPress={() => setConfirmVisible(false)}
                                className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center"
                              >
                                  <Text className="text-white font-black uppercase tracking-widest text-xs">Stay</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                onPress={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 h-16 rounded-2xl bg-red-500 items-center justify-center shadow-xl shadow-red-500/30"
                              >
                                  {actionLoading ? (
                                      <ActivityIndicator color="white" />
                                  ) : (
                                      <View className="flex-row items-center gap-2">
                                          <Text className="text-white font-black uppercase tracking-widest text-xs">Remove</Text>
                                      </View>
                                  )}
                              </TouchableOpacity>
                          </View>
                      </View>
                  </GlassCard>
              </Animated.View>
          </View>
      )}
    </View>
  );
}
