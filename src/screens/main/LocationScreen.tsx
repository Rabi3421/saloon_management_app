import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { Colors } from '../../theme/colors';
import { getPublicSalonInfo, SalonInfo } from '../../api/public';

export default function LocationScreen() {
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSalon = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicSalonInfo();
      setSalon(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load salon location.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSalon();
    }, [fetchSalon]),
  );

  const mapHtml = useMemo(() => {
    if (!salon?.location) {
      return null;
    }

    const latitude = salon.location.latitude;
    const longitude = salon.location.longitude;
    const title = JSON.stringify(salon.name || 'Salon');
    const address = JSON.stringify(salon.address || 'Address not available');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""
          />
          <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
            body { background: #f5f3ff; }
            .leaflet-control-attribution { font-size: 10px; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script
            src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""
          ></script>
          <script>
            const map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            L.marker([${latitude}, ${longitude}]).addTo(map)
              .bindPopup('<strong>' + ${title} + '</strong><br />' + ${address})
              .openPopup();
          </script>
        </body>
      </html>
    `;
  }, [salon]);

  const openExternalMap = useCallback(async () => {
    if (!salon?.location) {
      return;
    }

    const { latitude, longitude } = salon.location;
    const label = salon.address || salon.name || 'Salon';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${latitude},${longitude} (${label})`,
    )}`;
    await Linking.openURL(url);
  }, [salon]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Location</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : errorMessage ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Location unavailable</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : salon?.location && mapHtml ? (
          <>
            <View style={styles.mapCard}>
              <WebView
                source={{ html: mapHtml }}
                style={styles.map}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
              />
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.salonName}>{salon.name || 'Salon Location'}</Text>
              <Text style={styles.address}>{salon.address || 'Address not available'}</Text>
              {salon.phone ? <Text style={styles.meta}>📞 {salon.phone}</Text> : null}
              {salon.website ? <Text style={styles.meta}>🌐 {salon.website}</Text> : null}
              <Text style={styles.coordinates}>
                {salon.location.latitude.toFixed(5)}, {salon.location.longitude.toFixed(5)}
              </Text>
              <TouchableOpacity style={styles.directionBtn} onPress={openExternalMap}>
                <Text style={styles.directionBtnText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Map not ready yet</Text>
            <Text style={styles.errorText}>
              Save a precise salon address from the owner profile so we can place it on the map.
            </Text>
            {salon?.address ? <Text style={styles.address}>{salon.address}</Text> : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  mapCard: {
    flex: 1,
    minHeight: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  map: { flex: 1, backgroundColor: Colors.white },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  salonName: { fontSize: 20, fontWeight: '800', color: Colors.text },
  address: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, lineHeight: 20 },
  meta: { fontSize: 14, color: Colors.text, marginTop: 10 },
  coordinates: { fontSize: 12, color: Colors.grey, marginTop: 12 },
  directionBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  directionBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  stateCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  errorTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 10, textAlign: 'center' },
  errorText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, textAlign: 'center' },
});
