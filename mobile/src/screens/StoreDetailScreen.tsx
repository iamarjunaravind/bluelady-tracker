import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StoreDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { store } = route.params; // Expecting full store object

    const handleCall = () => {
        if (!store.phone_number) {
            Alert.alert('Error', 'No phone number available');
            return;
        }
        Linking.openURL(`tel:${store.phone_number}`);
    };

    const handleDirections = () => {
        if (!store.latitude || !store.longitude) {
            Alert.alert('Error', 'Store location not available');
            return;
        }
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${store.latitude},${store.longitude}`;
        const label = store.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        if (url) Linking.openURL(url);
    };

    const handleCheckIn = () => {
        navigation.navigate('StoreVisit', { storeId: store.id, storeName: store.name });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Image Section */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: 'https://via.placeholder.com/400x200?text=Store+Image' }} 
                        style={styles.heroImage} 
                    />
                    <View style={styles.badgeContainer}>
                        <View style={styles.brandBadge}><Text style={styles.badgeText}>BRAND_IMAGE</Text></View>
                        {store.is_approved && (
                            <View style={styles.approvedBadge}><Text style={styles.approvedText}>APPROVED</Text></View>
                        )}
                    </View>
                    <View style={styles.paginationDot} />
                </View>

                {/* Store Info */}
                <View style={styles.infoSection}>
                    <View style={styles.headerRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.storeName}>{store.name}</Text>
                            <Text style={styles.storeSubtext}>{store.address}</Text>
                        </View>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity style={styles.outlineButton} onPress={() => Alert.alert('Survey', 'Coming Soon!')}>
                                <Text style={styles.outlineButtonText}>TAKE SURVEY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.textButton} onPress={() => Alert.alert('Attribution', 'Coming Soon!')}>
                                <Text style={styles.textButtonText}>ATTRIBUTION FORM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Action Grid */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionItem} onPress={handleCall}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="phone" size={24} color="#007AFF" />
                        </View>
                        <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionItem} onPress={handleDirections}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="map-marker-path" size={24} color="#007AFF" />
                        </View>
                        <Text style={styles.actionLabel}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert('QR', 'Adding QR...')}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#007AFF" />
                        </View>
                        <Text style={styles.actionLabel}>Add Other QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={handleCheckIn}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="check" size={24} color="#007AFF" />
                        </View>
                        <Text style={styles.actionLabel}>Check In</Text>
                    </TouchableOpacity>
                </View>

                {/* Lead Generation */}
                <View style={styles.sectionContainer}>
                    <View style={{flex: 1}}>
                        <Text style={styles.sectionTitle}>Lead Generation</Text>
                        <Text style={styles.sectionSubtitle}>Capture merchant interest?</Text>
                    </View>
                    <TouchableOpacity style={styles.solidButton} onPress={() => Alert.alert('Lead', 'Generating Lead...')}>
                        <Text style={styles.solidButtonText}>GENERATE LEAD</Text>
                    </TouchableOpacity>
                </View>

                {/* Category Forms */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Category Forms</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Categories', 'Viewing Categories...')}>
                        <Text style={styles.linkText}>VIEW CATEGORIES</Text>
                    </TouchableOpacity>
                </View>

                {/* Orders Placed */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Orders Placed</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Orders', 'Viewing Orders...')}>
                        <Text style={styles.linkText}>VIEW ORDERS</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert('Proceed', 'Proceeding...')}>
                <Text style={styles.footerButtonText}>PROCEED</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Light gray background
    },
    scrollContent: {
        paddingBottom: 80,
    },
    imageContainer: {
        height: 200,
        backgroundColor: '#ddd',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badgeContainer: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    brandBadge: {
        backgroundColor: 'rgba(230, 240, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    approvedBadge: {
        backgroundColor: 'rgba(230, 240, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    approvedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    paginationDot: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF', // Active dot color
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    storeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    storeSubtext: {
        fontSize: 12,
        color: '#666',
    },
    headerButtons: {
        alignItems: 'flex-end',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 15, // Pill shape
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: 8,
        backgroundColor: '#E6F0FF',
    },
    outlineButtonText: {
        color: '#007AFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    textButton: {
        padding: 4,
    },
    textButtonText: {
        color: '#007AFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionGrid: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    actionItem: {
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 50,
        height: 50,
        backgroundColor: '#F0F4F8',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        color: '#007AFF',
    },
    sectionContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 2, // Thin separator
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    solidButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    solidButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footerButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
