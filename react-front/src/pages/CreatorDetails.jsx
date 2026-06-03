import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Loader, Group, Badge, Stack } from '@mantine/core';
import api from '../api/api';
import Slider from '../components/Slider';

export default function CreatorDetails() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/creators/${id}`)
      .then(res => setCreator(res.data.kreator))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ display: 'flex' }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          {loading ? <Loader /> : creator && (
            <>
              <Title order={2}>{creator.naziv_stranice}</Title>
              <Text c="dimmed" mb="md">{creator.opis}</Text>
              <Title order={4} mt="lg">Nivoi pretplate</Title>
              <Stack gap="sm">
                {creator.sub_levels?.map(level => (
                  <Group key={level.id} justify="space-between">
                    <Text fw={500}>{level.naziv}</Text>
                    <Badge color="blue">{level.cena_mesecno} EUR/mesečno</Badge>
                  </Group>
                ))}
              </Stack>
            </>
          )}
        </Container>
      </div>
    </div>
  );
}