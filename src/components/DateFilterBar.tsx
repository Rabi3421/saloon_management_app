import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function toBookingDateKey(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return toDateKey(d);
}

export type DateFilter = 'all' | 'today' | string; // string = 'YYYY-MM-DD'

interface Props {
  value: DateFilter;
  onChange: (v: DateFilter) => void;
}

export default function DateFilterBar({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const now = new Date();
  const todayKey = toDateKey(now);

  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDateKey = value !== 'all' && value !== 'today' ? value : null;

  const formatPickedLabel = () => {
    if (!selectedDateKey) return 'Pick date';
    const [y, m, d] = selectedDateKey.split('-');
    return `${parseInt(d)} ${MONTHS[parseInt(m)-1].substring(0,3)} ${y}`;
  };

  const isActive = (type: 'all' | 'today' | 'picked') => {
    if (type === 'all') return value === 'all';
    if (type === 'today') return value === 'today';
    return !!selectedDateKey;
  };

  return (
    <>
      <View style={styles.bar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <TouchableOpacity
            style={[styles.chip, isActive('all') && styles.chipActive]}
            onPress={() => onChange('all')}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, isActive('all') && styles.chipTextActive]}>All Dates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, isActive('today') && styles.chipActive]}
            onPress={() => onChange('today')}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, isActive('today') && styles.chipTextActive]}>📅 Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, isActive('picked') && styles.chipActive]}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, isActive('picked') && styles.chipTextActive]}>
              🗓 {formatPickedLabel()}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Calendar modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.calBox}>
            <Text style={styles.calTitle}>Pick a Date</Text>

            {/* Month nav */}
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                else setCalMonth(m => m - 1);
              }} style={styles.navBtn}>
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthText}>{MONTHS[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                else setCalMonth(m => m + 1);
              }} style={styles.navBtn}>
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View style={styles.daysRow}>
              {DAYS_SHORT.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {cells.map((cell, idx) => {
                const key = cell ? `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(cell).padStart(2,'0')}` : null;
                const isSel = key === selectedDateKey;
                const isToday2 = key === todayKey;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.cell, isSel && styles.cellSel, isToday2 && !isSel && styles.cellToday]}
                    onPress={() => {
                      if (key) { onChange(key); setShowPicker(false); }
                    }}
                    disabled={!cell}>
                    <Text style={[styles.cellText, isSel && styles.cellTextSel, isToday2 && !isSel && styles.cellTextToday]}>
                      {cell || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: { height: 50 },
  row: { paddingHorizontal: 14, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.greyBorder,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  calBox: {
    backgroundColor: Colors.white, borderRadius: 24, padding: 20,
    width: 320,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12,
  },
  calTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 14 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.greyLight, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 20, color: Colors.text, lineHeight: 24 },
  calMonthText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  daysRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  cellSel: { backgroundColor: Colors.primary },
  cellToday: { borderWidth: 1.5, borderColor: Colors.primary },
  cellText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  cellTextSel: { color: Colors.white, fontWeight: '700' },
  cellTextToday: { color: Colors.primary, fontWeight: '700' },
  cancelBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
});
