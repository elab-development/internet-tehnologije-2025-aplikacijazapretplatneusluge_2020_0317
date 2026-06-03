import React from 'react';
import { Container, Title, Text } from '@mantine/core';
import Slider from '../components/Slider';

export default function HomeAdmin() {
  return (
    <div style={{ display: 'flex' }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container>
          <Title order={2}>Admin panel</Title>
          <Text>Upravljanje korisnicima, kreatorima i statistikom.</Text>
        </Container>
      </div>
    </div>
  );
}