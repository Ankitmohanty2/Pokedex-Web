import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Image,
  Text,
  VStack,
  HStack,
  Tag,
  Grid,
  Progress,
  Button,
  Heading,
  Skeleton,
} from '@chakra-ui/react';

const PokemonDetail = () => {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        setPokemon(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  const getTypeColor = (type) => {
    const colors = {
      fire: 'red',
      water: 'blue',
      grass: 'green',
      electric: 'yellow',
      psychic: 'pink',
      ice: 'cyan',
      dragon: 'purple',
      dark: 'gray',
      fairy: 'pink',
      normal: 'gray',
      fighting: 'orange',
      flying: 'blue',
      poison: 'purple',
      ground: 'orange',
      rock: 'gray',
      bug: 'green',
      ghost: 'purple',
      steel: 'gray',
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Skeleton height="500px" borderRadius="lg" />
      </Container>
    );
  }

  if (!pokemon) {
    return (
      <Container maxW="4xl" py={8}>
        <Text textAlign="center" fontSize="xl">Pokemon not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <Button
        as={RouterLink}
        to="/"
        mb={6}
        colorScheme="blue"
      >
        ← Back to List
      </Button>

      <Box
        bg="white"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
        p={8}
        boxShadow="xl"
      >
        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
          <VStack spacing={6}>
            <Image
              src={pokemon.sprites.other['official-artwork'].front_default}
              alt={pokemon.name}
              w="full"
              borderRadius="lg"
            />
            <Heading size="lg" textTransform="capitalize">
              {pokemon.name}
            </Heading>
            <HStack spacing={2} wrap="wrap" justify="center">
              {pokemon.types.map((type) => (
                <Tag
                  key={type.type.name}
                  colorScheme={getTypeColor(type.type.name)}
                  size="lg"
                  textTransform="capitalize"
                >
                  {type.type.name}
                </Tag>
              ))}
            </HStack>
          </VStack>

          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="md" mb={4}>Base Stats</Heading>
              {pokemon.stats.map((stat) => (
                <Box key={stat.stat.name} mb={4}>
                  <HStack justify="space-between" mb={2}>
                    <Text textTransform="capitalize" fontWeight="medium">
                      {stat.stat.name}
                    </Text>
                    <Text fontWeight="bold">{stat.base_stat}</Text>
                  </HStack>
                  <Progress
                    value={stat.base_stat}
                    max={255}
                    colorScheme={stat.base_stat > 150 ? 'green' : stat.base_stat > 75 ? 'blue' : 'orange'}
                    borderRadius="full"
                  />
                </Box>
              ))}
            </Box>

            <Box>
              <Heading size="md" mb={4}>Abilities</Heading>
              <HStack spacing={2} wrap="wrap">
                {pokemon.abilities.map((ability) => (
                  <Tag
                    key={ability.ability.name}
                    size="lg"
                    textTransform="capitalize"
                    colorScheme="purple"
                  >
                    {ability.ability.name}
                  </Tag>
                ))}
              </HStack>
            </Box>
          </VStack>
        </Grid>
      </Box>
    </Container>
  );
};

export default PokemonDetail;