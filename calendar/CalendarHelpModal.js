import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import styles from '../styles/CalendarScreenStyles.js';

const CalendarHelpModal = ({ visible, onClose, t }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text style={styles.modalTitle}>{t('calendarScreen.help.title')}</Text>
            <Text style={styles.modalText}>
              • {t('calendarScreen.help.content.overview')}{"\n\n"}
              • {t('calendarScreen.help.content.energyLevels')}{"\n\n"}
              • {t('calendarScreen.help.content.timeBlocks')}{"\n\n"}
              • {t('calendarScreen.help.content.priorities')}{"\n\n"}
              • {t('calendarScreen.help.content.streak')}{"\n\n"}
              • {t('calendarScreen.help.content.collapsing')}{"\n\n"}
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{t('calendarScreen.help.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarHelpModal;