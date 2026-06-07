import React, { useState } from "react";
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Modal,
  ScrollArea,
} from "@mantine/core";
import {
  IconCalendar,
  IconEye,
  IconLock,
  IconUsers,
  IconArrowsMaximize,
} from "@tabler/icons-react";

// Helper funkcije za prikaz pristupa
const getAccessIcon = (pristup) => {
  switch (pristup) {
    case "javno":
      return <IconEye size={16} />;
    case "pretplatnici":
      return <IconUsers size={16} />;
    case "nivo":
      return <IconLock size={16} />;
    default:
      return null;
  }
};

const getAccessColor = (pristup) => {
  switch (pristup) {
    case "javno":
      return "green";
    case "pretplatnici":
      return "blue";
    case "nivo":
      return "orange";
    default:
      return "gray";
  }
};

const getAccessLabel = (pristup) => {
  switch (pristup) {
    case "javno":
      return "Javno";
    case "pretplatnici":
      return "Samo pretplatnici";
    case "nivo":
      return "Određeni nivo";
    default:
      return pristup;
  }
};

/**
 * Reusable komponenta za prikaz objave u obliku kartice.
 *
 * @param {Object} post - Objekat objave (mora sadržati: id, naslov, sadrzaj, datum_objave, pristup, opciono tier_name)
 * @param {boolean} showReadMore - Da li prikazati dugme za prikaz cele objave (default: true)
 */
export default function PostCard({ post, showReadMore = true}) {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <Card withBorder shadow="sm" radius="md" padding="lg">
        {/* Zaglavlje sa naslovom i akcijama */}
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between" align="center">
            <Text fw={700} size="lg" lineClamp={1}>
              {post.naslov}
            </Text>
          </Group>
        </Card.Section>

        {/* Telo kartice */}
        <Stack gap="sm" mt="sm">
          {/* Sadržaj – ograničen na 4 reda */}
          <Text size="sm" lineClamp={4}>
            {post.sadrzaj}
          </Text>

          {/* Datum objave */}
          <Group gap="xs" align="center">
            <IconCalendar size={14} color="gray" />
            <Text size="xs" c="dimmed">
              {new Date(post.datum_objave).toLocaleDateString()}
            </Text>
          </Group>

          {/* Pristup i nivo */}
          <Group gap="xs" align="center">
            {getAccessIcon(post.pristup)}
            <Badge color={getAccessColor(post.pristup)} variant="light">
              {getAccessLabel(post.pristup)}
            </Badge>
            {post.pristup === "nivo" && post.tier_name && (
              <Badge color="violet" variant="outline">
                Nivo: {post.tier_name}
              </Badge>
            )}
          </Group>

          {/* Dugme za prikaz cele objave */}
          {showReadMore && (
            <Button
              variant="subtle"
              color="blue"
              fullWidth
              mt="xs"
              leftSection={<IconArrowsMaximize size={16} />}
              onClick={() => setModalOpened(true)}
            >
              Pročitaj više
            </Button>
          )}
        </Stack>
      </Card>

      {/* Modal za prikaz cele objave */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={post.naslov}
        size="lg"
        radius="md"
        centered
      >
        <ScrollArea h={400} type="auto" offsetScrollbars>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {new Date(post.datum_objave).toLocaleDateString()}
            </Text>
            <Text style={{ whiteSpace: "pre-wrap" }}>{post.sadrzaj}</Text>
            <Group gap="xs">
              {getAccessIcon(post.pristup)}
              <Badge color={getAccessColor(post.pristup)} variant="light">
                {getAccessLabel(post.pristup)}
              </Badge>
              {post.pristup === "nivo" && post.tier_name && (
                <Badge color="violet" variant="outline">
                  Nivo: {post.tier_name}
                </Badge>
              )}
            </Group>
          </Stack>
        </ScrollArea>
      </Modal>
    </>
  );
}