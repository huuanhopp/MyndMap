import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

const CompletionTipsModal = ({ visible, onClose, task }) => {
  const { t } = useTranslation();

  const tips = [
    {
      icon: 'clock-o',
      title: t('completionTips.timeManagement'),
      text: t('completionTips.timeManagementText')
    },
    {
      icon: 'star',
      title: t('completionTips.consistency'),
      text: t('completionTips.consistencyText')
    },
    {
      icon: 'tasks',
      title: t('completionTips.breakDown'),
      text: t('completionTips.breakDownText')
    }
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('completionTips.title')}</Text>
            <FontAwesome name="trophy" size={32} color="#FFD700" />
          </View>

          <Text style={styles.subtitle}>
            {t('completionTips.greatJob')}
          </Text>

          {tips.map((tip, index) => (
            <View key={index} style={styles.tipContainer}>
              <FontAwesome name={tip.icon} size={24} color="#FF6347" style={styles.tipIcon} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('general.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 15,
    marginTop: 3,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompletionTipsModal;