import React from "react";
import { Container, Title, Text, Button, Group, Card, SimpleGrid } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconUsers, IconArticle, IconHeart } from "@tabler/icons-react";

export default function HomeGuest() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <Container size="lg" py="xl">
        {/* Hero sekcija */}
        <Card withBorder shadow="lg" radius="md" padding="xl" mb="xl" style={{ textAlign: "center", backgroundColor: "rgba(255,255,255,0.9)" }}>
          <Title order={1} mb="md">Dobrodošli na Patron Star</Title>
          <Text size="lg" mb="lg">
            Platforma koja povezuje kreatore i njihove pratioce. Otkrijte ekskluzivni sadržaj i podržite rad onih koje volite.
          </Text>
          <Group justify="center">
            <Button component={Link} to="/auth" size="md" variant="filled">Prijavite se</Button>
            <Button component={Link} to="/creators" size="md" variant="light">Pregledajte kreatore</Button>
          </Group>
        </Card>

        {/* Kartice sa prednostima */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Card withBorder shadow="sm" radius="md" padding="lg" style={{ backgroundColor: "white" }}>
            <IconUsers size={48} stroke={1.5} color="#228be6" />
            <Title order={3} mt="md">Podržite kreatore</Title>
            <Text>Pretplatite se na svoje omiljene autore i pomozite im da nastave da stvaraju.</Text>
          </Card>
          <Card withBorder shadow="sm" radius="md" padding="lg" style={{ backgroundColor: "white" }}>
            <IconArticle size={48} stroke={1.5} color="#228be6" />
            <Title order={3} mt="md">Ekskluzivni sadržaj</Title>
            <Text>Pristupite jedinstvenim objavama, video zapisima i drugom materijalu.</Text>
          </Card>
          <Card withBorder shadow="sm" radius="md" padding="lg" style={{ backgroundColor: "white" }}>
            <IconHeart size={48} stroke={1.5} color="#228be6" />
            <Title order={3} mt="md">Zajednica</Title>
            <Text>Povežite se sa kreatorima i drugim ljubiteljima umetnosti.</Text>
          </Card>
        </SimpleGrid>

        {/* Dodatna CTA */}
        <Card withBorder shadow="sm" radius="md" padding="xl" mt="xl" style={{ textAlign: "center", backgroundColor: "#228be6", color: "white" }}>
          <Title order={2} mb="md">Spremni da započnete?</Title>
          <Text mb="lg">Registrujte se besplatno i pridružite se našoj zajednici.</Text>
          <Button component={Link} to="/auth" variant="white" color="dark">Registruj se</Button>
        </Card>
      </Container>
    </div>
  );
}