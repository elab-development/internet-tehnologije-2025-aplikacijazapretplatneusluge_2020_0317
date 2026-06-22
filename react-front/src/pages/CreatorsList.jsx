import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Button,
  Loader,
  Group,
  Pagination,
  Stack,
  Alert,
} from "@mantine/core";
import { IconUsers, IconArticle, IconArrowRight } from "@tabler/icons-react";
import api from "../api/api";
import Slider from "../components/Slider";

export default function CreatorsList() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatorsPage, setCreatorsPage] = useState(1);
  const [creatorsTotalPages, setCreatorsTotalPages] = useState(1);
  const CREATORS_PER_PAGE = 15;

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await api.get(`/creators?page=${creatorsPage}&per_page=${CREATORS_PER_PAGE}`);
        setCreators(res.data.kreatori?.data || []);
        setCreatorsTotalPages(res.data.kreatori?.last_page || 1);
      } catch (err) {
        console.error(err);
        setError("Ne mogu da učitam listu kreatora.");
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, [creatorsPage]);

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Alert color="red" title="Greška">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Svi kreatori</Title>

          {creators.length === 0 ? (
            <Alert color="blue">Trenutno nema registrovanih kreatora.</Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {creators.map((creator) => (
                <Card key={creator.id} withBorder shadow="sm" radius="md" padding="lg">
                  <Stack gap="md">
                    <Text fw={700} size="lg" lineClamp={1}>
                      {creator.naziv_stranice}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={3}>
                      {creator.opis || "Nema opisa."}
                    </Text>

                    <Group gap="md">
                      <Group gap={4}>
                        <IconArticle size={16} />
                        <Text size="sm">{creator.posts_count || 0} objava</Text>
                      </Group>
                      <Group gap={4}>
                        <IconUsers size={16} />
                        <Text size="sm">{creator.subscribers_count || 0} pretplatnika</Text>
                      </Group>
                    </Group>

                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      rightSection={<IconArrowRight size={16} />}
                      onClick={() => navigate(`/creators/${creator.id}`)}
                    >
                      Pogledaj profil
                    </Button>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
          {creatorsTotalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                total={creatorsTotalPages}
                value={creatorsPage}
                onChange={setCreatorsPage}
              />
            </Group>
          )}
        </Container>
      </div>
    </div>
  );
}