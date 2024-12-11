import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Container, SimpleGrid, Skeleton, useColorMode, Flex, Text } from '@chakra-ui/react';
import { FocusCard } from './ui/FocusCard';
import { Command } from './ui/Command';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { MovingBorderTitle } from './ui/MovingBorderTitle';

const PokemonList = () => {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const limit = 20;

  const fetchPokemon = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      );
      
      if (response.data.results.length === 0) {
        setHasMore(false);
        return;
      }

      const pokemonData = await Promise.all(
        response.data.results.map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          return {
            id: details.data.id,
            name: details.data.name.replace(/-/g, ' '),
            image: details.data.sprites.other['official-artwork'].front_default,
            types: details.data.types.map(type => type.type.name),
            stats: details.data.stats.map(stat => ({
              name: stat.stat.name,
              value: stat.base_stat
            }))
          };
        })
      );

      setPokemon(prev => {
        const newPokemon = [...prev, ...pokemonData];
        return Array.from(new Map(newPokemon.map(p => [p.id, p])).values());
      });
      setOffset(prev => prev + limit);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchPokemon();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredPokemon(pokemon);
      return;
    }

    const filtered = pokemon.filter(poke => 
      poke.name.toLowerCase().includes(query) ||
      poke.types.some(type => type.toLowerCase().includes(query))
    );
    setFilteredPokemon(filtered);
  }, [searchQuery, pokemon]);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const renderSkeletons = (count, keyPrefix) => (
    [...Array(count)].map((_, i) => (
      <Skeleton 
        key={`${keyPrefix}-skeleton-${i}`}
        height="350px" 
        borderRadius="xl"
        startColor={colorMode === 'light' ? 'gray.100' : 'gray.700'}
        endColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
        className="transform transition-all duration-300 hover:scale-[1.02]"
      />
    ))
  );

  return (
    <Box 
      minH="100vh" 
      w="100%"
      position="relative"
      overflow="hidden"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
    >
      <Box 
        py={6}
        position="sticky"
        top={0}
        zIndex={10}
        bgImage="url('/pika.jpg')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)'}
          backdropFilter="blur(8px)"
        />
  
        <Container maxW="7xl" position="relative">
          <Flex direction="column" gap={8}>
            <Flex justify="space-between" align="center">
              <MovingBorderTitle
                containerClassName="w-[200px]"
                borderClassName="bg-[radial-gradient(var(--purple-500)_40%,transparent_60%)]"
                className="border-none bg-slate-900/[0.2]"
                duration={2500}
              >
                <Flex align="center" gap={2} className="group">
                  <Box 
                    as="img" 
                    src="/pokeball.png" 
                    w="30px" 
                    h="30px"
                    className="animate-bounce-slow group-hover:animate-none transition-all duration-300"
                    style={{ 
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                  <Box 
                    as="h1" 
                    fontSize="2xl" 
                    fontWeight="bold"
                    color="white"
                  >
                    Pokédex
                  </Box>
                </Flex>
              </MovingBorderTitle>
  
              <Box
                onClick={toggleColorMode}
                cursor="pointer"
                p={2}
                borderRadius="lg"
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                boxShadow="sm"
              >
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Box>
            </Flex>
  
            <Command
              value={searchQuery}
              onChange={handleSearch}
            />
          </Flex>
        </Container>
      </Box>
  
      <Container maxW="7xl" px={[4, 6, 8]} py={8} position="relative" zIndex={2}>
        {isLoading && pokemon.length === 0 ? (
          <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
            {renderSkeletons(8, 'initial')}
          </SimpleGrid>
        ) : filteredPokemon.length === 0 ? (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            minH="60vh"
            gap={4}
          >
            <Box 
              as="img" 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png"
              w="200px"
              h="200px"
              opacity={0.7}
            />
            <Text 
              fontSize="xl" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
              fontWeight="medium"
              textAlign="center"
            >
              No Pokémon found matching "{searchQuery}"
            </Text>
            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} textAlign="center">
              Try searching for a different name or type
            </Text>
          </Flex>
        ) : (
          <InfiniteScroll
            dataLength={filteredPokemon.length}
            next={fetchPokemon}
            hasMore={hasMore && !searchQuery}
            loader={
              <SimpleGrid columns={[1, 2, 3, 4]} spacing={6} mt={6}>
                {renderSkeletons(4, 'scroll')}
              </SimpleGrid>
            }
            style={{ overflow: 'visible' }}
          >
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
              {filteredPokemon.map((poke) => (
                <FocusCard
                  key={`pokemon-${poke.id}`}
                  pokemon={poke}
                  hovered={hovered}
                  setHovered={setHovered}
                  onClick={() => navigate(`/pokemon/${poke.id}`)}
                />
              ))}
            </SimpleGrid>
          </InfiniteScroll>
        )}
      </Container>
    </Box>
  );
};

export default PokemonList;