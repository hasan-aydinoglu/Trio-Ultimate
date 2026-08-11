import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  Ionicons,
} from '@expo/vector-icons';

export default function PrivacyScreen({
  navigation,
}) {
  return (
    <LinearGradient
      colors={[
        '#00c6ff',
        '#0072ff',
        '#000000',
      ]}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.goBack()
        }
        activeOpacity={0.8}
      >
        <Ionicons
          name="arrow-back"
          size={27}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <View
          style={
            styles.headerContainer
          }
        >
          <View
            style={
              styles.iconContainer
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={40}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={
              styles.title
            }
          >
            trio-game.com
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Privacy Policy
          </Text>

          <Text
            style={
              styles.updatedText
            }
          >
            TRIO Mobile Application
          </Text>
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            TRIO Privacy Policy
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            This Privacy Policy explains how
            TRIO collects, uses and protects
            information when users access the
            TRIO mobile application and its
            related services.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Information We Collect
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            When you use TRIO, certain
            information may be stored in order
            to provide the application's
            features. This may include account
            information, username, email
            address, profile information,
            profile photo, gameplay activity,
            friends and messaging information.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Account Information
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            Users may create an account to use
            TRIO features. Account information
            may include a username, email
            address, profile name and profile
            image.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Player Profiles
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            TRIO includes player profile
            features. Some profile information
            may be visible to other users when
            participating in multiplayer games
            or using social features within the
            application.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Multiplayer Features
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            TRIO allows users to participate in
            multiplayer games. Player names,
            profile photos and certain gameplay
            information may be displayed to
            other players during online games.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Friends
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            Users can search for other players,
            send friend requests, accept or
            reject requests and maintain a
            friends list within the
            application.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Messaging
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            TRIO provides messaging features
            that allow users to communicate
            with other players. Information
            required to provide these features
            may be stored as part of the
            application service.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Gameplay Information
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            Gameplay information may be stored
            to support game functionality,
            player statistics, scores, wins,
            online matches and other gameplay
            features.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            How We Use Information
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            Information collected through TRIO
            is used to operate the application,
            maintain user accounts, provide
            multiplayer functionality, support
            social features, improve user
            experience and maintain application
            security.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Data Storage
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            TRIO uses cloud-based services to
            support account, profile,
            multiplayer and social
            functionality. Information may be
            stored securely as required to
            provide these services.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Data Security
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            Reasonable measures are taken to
            protect user information and reduce
            the risk of unauthorized access,
            misuse or disclosure.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            User Control
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            Users may update certain profile
            information through the TRIO
            application. Users may also manage
            friends and other supported social
            features through their account.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Changes to This Policy
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            This Privacy Policy may be updated
            when TRIO introduces new features
            or changes how information is
            handled. Updated information will
            be reflected in this Privacy Policy.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Official Website
          </Text>

          <View
            style={
              styles.websiteBox
            }
          >
            <Ionicons
              name="globe-outline"
              size={22}
              color="#00E5FF"
            />

            <View
              style={
                styles.websiteTextContainer
              }
            >
              <Text
                style={
                  styles.websiteLabel
                }
              >
                TRIO Official Website
              </Text>

              <Text
                style={
                  styles.website
                }
              >
                trio-game.com
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Contact
          </Text>

          <Text
            style={
              styles.paragraph
            }
          >
            If you have questions about this
            Privacy Policy or how TRIO handles
            information, please use the Contact
            Support section in the application
            or visit trio-game.com.
          </Text>
        </View>

        <View
          style={
            styles.footerContainer
          }
        >
          <Ionicons
            name="shield-checkmark"
            size={18}
            color="#B8EAFF"
          />

          <Text
            style={
              styles.footer
            }
          >
            TRIO • trio-game.com
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    backButton: {
      position: 'absolute',

      top: 55,
      left: 18,

      width: 44,
      height: 44,

      borderRadius: 22,

      zIndex: 20,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255,255,255,0.15)',

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.25)',
    },

    content: {
      paddingTop: 115,

      paddingHorizontal: 20,

      paddingBottom: 50,
    },

    headerContainer: {
      alignItems: 'center',

      marginBottom: 28,
    },

    iconContainer: {
      width: 74,
      height: 74,

      borderRadius: 37,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(255,255,255,0.16)',

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.25)',

      marginBottom: 16,
    },

    title: {
      color: '#FFFFFF',

      fontSize: 30,

      fontWeight: '800',

      textAlign: 'center',
    },

    subtitle: {
      color: '#FFFFFF',

      fontSize: 23,

      fontWeight: '700',

      marginTop: 3,

      textAlign: 'center',
    },

    updatedText: {
      color: '#B8EAFF',

      fontSize: 14,

      marginTop: 8,

      fontWeight: '500',
    },

    card: {
      width: '100%',

      backgroundColor:
        'rgba(255,255,255,0.14)',

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.22)',

      padding: 21,
    },

    cardTitle: {
      color: '#FFFFFF',

      fontSize: 22,

      fontWeight: '800',

      marginBottom: 16,
    },

    sectionTitle: {
      color: '#FFFFFF',

      fontSize: 18,

      fontWeight: '700',

      marginTop: 22,

      marginBottom: 8,
    },

    paragraph: {
      color: '#EAF7FF',

      fontSize: 15.5,

      lineHeight: 24,
    },

    websiteBox: {
      flexDirection: 'row',

      alignItems: 'center',

      marginTop: 8,

      paddingVertical: 14,

      paddingHorizontal: 15,

      borderRadius: 15,

      backgroundColor:
        'rgba(0,0,0,0.22)',

      borderWidth: 1,

      borderColor:
        'rgba(255,255,255,0.12)',
    },

    websiteTextContainer: {
      marginLeft: 11,
    },

    websiteLabel: {
      color: '#B8EAFF',

      fontSize: 12,

      fontWeight: '600',

      marginBottom: 2,
    },

    website: {
      color: '#FFFFFF',

      fontSize: 18,

      fontWeight: '800',
    },

    footerContainer: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      marginTop: 25,
    },

    footer: {
      color:
        'rgba(255,255,255,0.7)',

      fontSize: 13,

      fontWeight: '500',

      marginLeft: 6,
    },
  });