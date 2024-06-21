import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';
import cheerio from 'cheerio';

const DownloadScreen = () => {
  const [url, setUrl] = useState('');

  const fetchVideoUrl = async (url) => {
    try {
      const response = await fetch('https://dlpanda.com/id');
      const html = await response.text();
      const $ = cheerio.load(html);
      const token = $('#token').attr('value');

      const videoResponse = await fetch(`https://dlpanda.com/id?url=${url}&token=${token}`);
      const videoHtml = await videoResponse.text();
      const videoPage = cheerio.load(videoHtml);

      if (videoHtml.match(/downVideo\(\'(.*?)\'/)) {
        const scriptDownload = videoHtml.match(/downVideo\(\'(.*?)\'/g);
        const video = scriptDownload[0].match(/downVideo\(\'(.*?)\'/)[1];
        return video;
      } else {
        throw new Error('Video URL not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch video URL');
      return null;
    }
  };

  const downloadFile = async (fileUrl, outputLocationPath) => {
    const response = await fetch(fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl);
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });

    const writer = RNFS.createWriteStream(outputLocationPath);

    return new Promise((resolve, reject) => {
      const readableStream = stream.getReader();
      const pipeToWriter = async () => {
        const { done, value } = await readableStream.read();
        if (done) {
          writer.close();
          resolve(true);
        } else {
          writer.write(value);
          pipeToWriter();
        }
      };
      pipeToWriter().catch(reject);
    });
  };

  const handleDownload = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const videoUrl = await fetchVideoUrl(url);

    if (videoUrl) {
      const downloadFolder = RNFS.DownloadDirectoryPath;
      const videoFilename = `${downloadFolder}/tiktok_video.mp4`;

      try {
        await downloadFile(videoUrl, videoFilename);
        Alert.alert('Success', `Video downloaded successfully to ${videoFilename}`);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to download video');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Paste TikTok video URL here"
        value={url}
        onChangeText={setUrl}
      />
      <Button title="Download" onPress={handleDownload} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default DownloadScreen;
