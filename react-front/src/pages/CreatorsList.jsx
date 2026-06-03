import React, { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Card, Text, Loader } from '@mantine/core';
import api from '../api/api';
import Slider from '../components/Slider';

export default function CreatorsList() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/creators')
      .then(res => setCreators(res.data.kreatori || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Svi kreatori</Title>
          {loading ? <Loader /> : (
            <SimpleGrid cols={3} spacing="lg">
              {creators.map(creator => (
                <Card key={creator.id} withBorder>
                  <Text fw={700}>{creator.naziv_stranice}</Text>
                  <Text size="sm" c="dimmed">{creator.opis}</Text>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </div>
    </div>
  );
}