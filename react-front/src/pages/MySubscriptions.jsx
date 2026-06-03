import React, { useEffect, useState } from 'react';
import { Container, Title, Table, Badge, Loader, Text } from '@mantine/core';
import api from '../api/api';
import Slider from '../components/Slider';

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions')
      .then(res => setSubscriptions(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Moje pretplate</Title>
          {loading ? <Loader /> : subscriptions.length === 0 ? (
            <Text c="dimmed">Nemate aktivnih pretplata.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kreator</Table.Th>
                  <Table.Th>Nivo</Table.Th>
                  <Table.Th>Cena</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {subscriptions.map(sub => (
                  <Table.Tr key={sub.id}>
                    <Table.Td>{sub.creator?.naziv_stranice || '-'}</Table.Td>
                    <Table.Td>{sub.tier?.naziv || 'Bez nivoa'}</Table.Td>
                    <Table.Td>{sub.tier?.cena_mesecno || 0} EUR</Table.Td>
                    <Table.Td><Badge color={sub.status === 'aktivna' ? 'green' : 'red'}>{sub.status}</Badge></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Container>
      </div>
    </div>
  );
}