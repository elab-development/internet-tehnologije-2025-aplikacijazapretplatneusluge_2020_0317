import React, { useEffect, useState } from 'react';
import { Card, Text, Loader, Button, Group } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import api from '../api/api';

export default function RandomQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



const fetchQuote = async () => {
    setLoading(true);
    try {
        const response = await api.get('/random-quote');
        setQuote(response.data);
        setError(null);
    } catch (err) {
        console.error(err);
        setError('Nije moguće učitati citat.');
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchQuote();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Text c="red">{error}</Text>;

  return (
    <Card withBorder shadow="sm" padding="lg" style={{ backgroundColor: '#f5f0e8' }}>
      <Text fw={700} size="lg" mb="md" ta="center">✨ Citat dana ✨</Text>
      <Text size="md" fs="italic" ta="center">“{quote?.content}”</Text>
      <Text ta="center" c="dimmed" mt="sm">— {quote?.author}</Text>
      <Group justify="center" mt="lg">
        <Button 
          variant="light" 
          leftSection={<IconRefresh size={16} />}
          onClick={fetchQuote}
        >
          Novi citat
        </Button>
      </Group>
    </Card>
  );
}