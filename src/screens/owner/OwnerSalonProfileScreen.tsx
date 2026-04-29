import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../theme/colors';
import {
  getSalonProfile,
  OwnerSalonProfile,
  updateSalonProfile,
} from '../../api/salonProfile';
import {SalonFeatureBanner} from '../../api/public';

interface Props {
  navigation: any;
}

interface BrandingFormState {
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  about: string;
  website: string;
  logo: string;
  coverImage: string;
  tagline: string;
  images: string[];
  featureBanners: SalonFeatureBanner[];
}

const emptyBanner = (): SalonFeatureBanner => ({
  title: '',
  subtitle: '',
  image: '',
  ctaLabel: '',
});

function mapProfileToState(profile: OwnerSalonProfile): BrandingFormState {
  return {
    name: profile.name ?? '',
    ownerName: profile.ownerName ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    about: profile.about ?? '',
    website: profile.website ?? '',
    logo: profile.logo ?? '',
    coverImage: profile.coverImage ?? '',
    tagline: profile.tagline ?? '',
    images: profile.images ?? [],
    featureBanners: profile.featureBanners?.length ? profile.featureBanners : [emptyBanner()],
  };
}

function sanitizeList(values: string[]) {
  return values.map(value => value.trim()).filter(Boolean);
}

function sanitizeBanners(values: SalonFeatureBanner[]) {
  return values
    .map(banner => ({
      title: banner.title.trim(),
      subtitle: banner.subtitle?.trim() || undefined,
      image: banner.image.trim(),
      ctaLabel: banner.ctaLabel?.trim() || undefined,
    }))
    .filter(banner => banner.title || banner.image);
}

export default function OwnerSalonProfileScreen({navigation}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGalleryImage, setNewGalleryImage] = useState('');
  const [form, setForm] = useState<BrandingFormState>({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    about: '',
    website: '',
    logo: '',
    coverImage: '',
    tagline: '',
    images: [],
    featureBanners: [emptyBanner()],
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const profile = await getSalonProfile();
        if (mounted) {
          setForm(mapProfileToState(profile));
        }
      } catch {
        Alert.alert('Unable to load', 'We could not load the salon profile right now.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const previewImages = useMemo(
    () => sanitizeList([form.coverImage, form.logo, ...form.images]).slice(0, 6),
    [form.coverImage, form.logo, form.images],
  );

  const setField = (field: keyof BrandingFormState, value: string | string[] | SalonFeatureBanner[]) => {
    setForm(current => ({...current, [field]: value}));
  };

  const updateBanner = (index: number, key: keyof SalonFeatureBanner, value: string) => {
    setForm(current => ({
      ...current,
      featureBanners: current.featureBanners.map((banner, bannerIndex) =>
        bannerIndex === index ? {...banner, [key]: value} : banner,
      ),
    }));
  };

  const addGalleryImage = () => {
    const trimmed = newGalleryImage.trim();
    if (!trimmed) {
      return;
    }

    setForm(current => ({
      ...current,
      images: sanitizeList([...current.images, trimmed]),
    }));
    setNewGalleryImage('');
  };

  const removeGalleryImage = (index: number) => {
    setForm(current => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const addBanner = () => {
    setForm(current => ({
      ...current,
      featureBanners: [...current.featureBanners, emptyBanner()],
    }));
  };

  const removeBanner = (index: number) => {
    setForm(current => ({
      ...current,
      featureBanners:
        current.featureBanners.length === 1
          ? [emptyBanner()]
          : current.featureBanners.filter((_, bannerIndex) => bannerIndex !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Salon name required', 'Please add the salon name before saving.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSalonProfile({
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        about: form.about.trim(),
        website: form.website.trim(),
        logo: form.logo.trim(),
        coverImage: form.coverImage.trim(),
        tagline: form.tagline.trim(),
        images: sanitizeList(form.images),
        featureBanners: sanitizeBanners(form.featureBanners),
      });

      setForm(mapProfileToState(updated));
      Alert.alert('Saved', 'Your salon branding has been updated.');
    } catch {
      Alert.alert('Save failed', 'We could not update the salon branding right now.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Salon Branding</Text>
          <Text style={styles.headerSubtitle}>Manage the visuals customers see first.</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.previewCard}>
          {previewImages[0] ? (
            <Image source={{uri: previewImages[0]}} style={styles.previewHero} resizeMode="cover" />
          ) : (
            <View style={[styles.previewHero, styles.previewHeroFallback]}>
              <Text style={styles.previewFallbackIcon}>🏪</Text>
            </View>
          )}
          <View style={styles.previewOverlay}>
            <Text style={styles.previewLabel}>Customer preview</Text>
            <Text style={styles.previewTitle}>{form.name || 'Your salon name'}</Text>
            <Text style={styles.previewSubtitle} numberOfLines={2}>
              {form.tagline || form.about || 'Add a tagline, cover image, and banners to make the home page feel alive.'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic details</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={value => setField('name', value)} placeholder="Salon name" placeholderTextColor={Colors.grey} />
          <TextInput style={styles.input} value={form.ownerName} onChangeText={value => setField('ownerName', value)} placeholder="Owner name" placeholderTextColor={Colors.grey} />
          <TextInput style={styles.input} value={form.tagline} onChangeText={value => setField('tagline', value)} placeholder="Short tagline" placeholderTextColor={Colors.grey} />
          <TextInput style={styles.input} value={form.phone} onChangeText={value => setField('phone', value)} placeholder="Phone number" placeholderTextColor={Colors.grey} keyboardType="phone-pad" />
          <TextInput style={styles.input} value={form.website} onChangeText={value => setField('website', value)} placeholder="Website" placeholderTextColor={Colors.grey} autoCapitalize="none" />
          <TextInput style={styles.input} value={form.address} onChangeText={value => setField('address', value)} placeholder="Address" placeholderTextColor={Colors.grey} multiline />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.about}
            onChangeText={value => setField('about', value)}
            placeholder="About your salon"
            placeholderTextColor={Colors.grey}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hero images</Text>
          <Text style={styles.sectionDescription}>Add hosted image URLs for the logo and cover image shown across the app.</Text>
          <TextInput style={styles.input} value={form.coverImage} onChangeText={value => setField('coverImage', value)} placeholder="Cover image URL" placeholderTextColor={Colors.grey} autoCapitalize="none" />
          <TextInput style={styles.input} value={form.logo} onChangeText={value => setField('logo', value)} placeholder="Logo image URL" placeholderTextColor={Colors.grey} autoCapitalize="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
            {previewImages.length === 0 ? (
              <Text style={styles.emptyNote}>Add a cover image, logo, or gallery image to preview it here.</Text>
            ) : (
              previewImages.map((image, index) => (
                <Image key={`${image}-${index}`} source={{uri: image}} style={styles.smallPreview} resizeMode="cover" />
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Gallery images</Text>
            <Text style={styles.sectionCount}>{form.images.length} items</Text>
          </View>
          <View style={styles.inlineInputRow}>
            <TextInput
              style={[styles.input, styles.inlineInput]}
              value={newGalleryImage}
              onChangeText={setNewGalleryImage}
              placeholder="Add gallery image URL"
              placeholderTextColor={Colors.grey}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addGalleryImage}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {form.images.length === 0 ? (
            <Text style={styles.emptyNote}>Gallery images help the user home and salon pages feel fuller.</Text>
          ) : (
            form.images.map((image, index) => (
              <View key={`${image}-${index}`} style={styles.assetRow}>
                <Image source={{uri: image}} style={styles.assetThumb} resizeMode="cover" />
                <Text style={styles.assetUrl} numberOfLines={2}>{image}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeGalleryImage(index)}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Feature banners</Text>
            <TouchableOpacity onPress={addBanner}>
              <Text style={styles.linkText}>+ Add banner</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDescription}>Use banners for welcome cards, offer highlights, or seasonal graphics.</Text>
          {form.featureBanners.map((banner, index) => (
            <View key={`banner-${index}`} style={styles.bannerCard}>
              <View style={styles.bannerHeader}>
                <Text style={styles.bannerTitle}>Banner {index + 1}</Text>
                <TouchableOpacity onPress={() => removeBanner(index)}>
                  <Text style={styles.removeLink}>Remove</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={styles.input} value={banner.title} onChangeText={value => updateBanner(index, 'title', value)} placeholder="Banner title" placeholderTextColor={Colors.grey} />
              <TextInput style={styles.input} value={banner.subtitle || ''} onChangeText={value => updateBanner(index, 'subtitle', value)} placeholder="Banner subtitle" placeholderTextColor={Colors.grey} />
              <TextInput style={styles.input} value={banner.image} onChangeText={value => updateBanner(index, 'image', value)} placeholder="Banner image URL" placeholderTextColor={Colors.grey} autoCapitalize="none" />
              <TextInput style={styles.input} value={banner.ctaLabel || ''} onChangeText={value => updateBanner(index, 'ctaLabel', value)} placeholder="CTA label" placeholderTextColor={Colors.grey} />
              {banner.image ? <Image source={{uri: banner.image}} style={styles.bannerPreview} resizeMode="cover" /> : null}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.bottomSaveText}>{saving ? 'Saving changes...' : 'Save salon branding'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.background},
  loaderWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {fontSize: 18, color: Colors.text, fontWeight: '700'},
  headerCopy: {flex: 1},
  headerTitle: {fontSize: 20, fontWeight: '800', color: Colors.text},
  headerSubtitle: {fontSize: 12, color: Colors.textSecondary, marginTop: 2},
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  saveBtnText: {color: Colors.white, fontWeight: '700', fontSize: 13},
  content: {paddingHorizontal: 16, paddingBottom: 32},
  previewCard: {
    height: 210,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: Colors.primaryDark,
  },
  previewHero: {width: '100%', height: '100%'},
  previewHeroFallback: {alignItems: 'center', justifyContent: 'center'},
  previewFallbackIcon: {fontSize: 52},
  previewOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
  },
  previewLabel: {fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '700'},
  previewTitle: {fontSize: 22, color: Colors.white, fontWeight: '800', marginTop: 4},
  previewSubtitle: {fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginTop: 6},
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
  sectionTitle: {fontSize: 16, fontWeight: '800', color: Colors.text},
  sectionDescription: {fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 12},
  sectionCount: {fontSize: 12, color: Colors.textSecondary, fontWeight: '600'},
  input: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: '#FAFAFF',
    marginBottom: 12,
  },
  textArea: {minHeight: 110},
  previewRow: {gap: 10, paddingTop: 4},
  smallPreview: {width: 94, height: 94, borderRadius: 16, backgroundColor: Colors.greyLight},
  inlineInputRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4},
  inlineInput: {flex: 1, marginBottom: 0},
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addBtnText: {color: Colors.white, fontSize: 13, fontWeight: '700'},
  emptyNote: {fontSize: 12, color: Colors.textSecondary, lineHeight: 18},
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    backgroundColor: '#F8F6FF',
    borderRadius: 16,
    padding: 10,
  },
  assetThumb: {width: 54, height: 54, borderRadius: 12, backgroundColor: Colors.greyLight},
  assetUrl: {flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18},
  removeBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  removeBtnText: {color: Colors.red, fontSize: 12, fontWeight: '700'},
  linkText: {fontSize: 13, color: Colors.primary, fontWeight: '700'},
  bannerCard: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    backgroundColor: '#FCFBFF',
  },
  bannerHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  bannerTitle: {fontSize: 14, fontWeight: '700', color: Colors.text},
  removeLink: {fontSize: 12, fontWeight: '700', color: Colors.red},
  bannerPreview: {width: '100%', height: 140, borderRadius: 16, marginTop: 4, backgroundColor: Colors.greyLight},
  bottomSaveBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  bottomSaveText: {color: Colors.white, fontSize: 15, fontWeight: '800'},
});