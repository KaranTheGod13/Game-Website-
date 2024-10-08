import pygame
import asyncio
from settings import *
from sprites import *

class Game:
    def __init__(self):
        pygame.init()  # Initialize Pygame modules
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption(TITLE)
        self.clock = pygame.time.Clock()
        self.start_time = pygame.time.get_ticks()  # Initialize the start time for the timer
        self.mines_left = AMOUNT_MINES  # Initialize the counter for mines left
        self.win = False

    def new(self):
        self.board = Board()
        self.board.display_board()
        self.mines_left = AMOUNT_MINES  # Reset the counter when a new game starts
        self.start_time = pygame.time.get_ticks()  # Reset the start time

    async def run(self):
        self.playing = True
        while self.playing:
            self.clock.tick(FPS)
            self.events()
            self.draw()
            await asyncio.sleep(0)  # Yield control to the event loop

        else:
            await self.end_screen()

    def draw(self):
        self.screen.fill(BGCOLOUR)
        self.board.draw(self.screen)

        # Draw Timer
        elapsed_time = (pygame.time.get_ticks() - self.start_time) // 1000  # Get elapsed time in seconds
        font = pygame.font.Font(None, 36)
        timer_text = font.render(f"Time: {elapsed_time}s", True, WHITE)
        self.screen.blit(timer_text, (10, 10))

        # Draw Mines Counter
        mines_text = font.render(f"Mines Left: {self.mines_left}", True, WHITE)
        self.screen.blit(mines_text, (WIDTH - 200, 10))

        pygame.display.flip()

    def check_win(self):
        for row in self.board.board_list:
            for tile in row:
                if tile.type != "X" and not tile.revealed:
                    return False
        return True

    def events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit(0)

            if event.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                mx //= TILESIZE
                my //= TILESIZE

                if event.button == 1:
                    if not self.board.board_list[mx][my].flagged:
                        # dig and check if exploded
                        if not self.board.dig(mx, my):
                            # explode
                            for row in self.board.board_list:
                                for tile in row:
                                    if tile.flagged and tile.type != "X":
                                        tile.flagged = False
                                        tile.revealed = True
                                        tile.image = tile_not_mine
                                    elif tile.type == "X":
                                        tile.revealed = True
                            self.playing = False

                if event.button == 3:
                    if not self.board.board_list[mx][my].revealed:
                        if self.board.board_list[mx][my].flagged:
                            self.mines_left += 1
                        else:
                            self.mines_left -= 1
                        self.board.board_list[mx][my].flagged = not self.board.board_list[mx][my].flagged

                if self.check_win():
                    self.win = True
                    self.playing = False
                    for row in self.board.board_list:
                        for tile in row:
                            if not tile.revealed:
                                tile.flagged = True

    async def end_screen(self):
        font = pygame.font.Font(None, 74)
        stats_font = pygame.font.Font(None, 36)
        if self.win:
            text = font.render("You Win!", True, GREEN)
        else:
            text = font.render("Game Over", True, RED)

        text_rect = text.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 100))
        restart_button = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2 + 10, 200, 50)
        pygame.draw.rect(self.screen, DARKGREEN, restart_button)
        restart_text = font.render("Restart", True, WHITE)
        restart_text_rect = restart_text.get_rect(center=restart_button.center)

        self.screen.blit(text, text_rect)

        stats_text = stats_font.render(f"Time: {(pygame.time.get_ticks() - self.start_time) // 1000}s", True, WHITE)
        stats_rect = stats_text.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 50))
        self.screen.blit(stats_text, stats_rect)

        mines_left_text = stats_font.render(f"Mines Left: {self.mines_left}", True, WHITE)
        mines_left_rect = mines_left_text.get_rect(center=(WIDTH // 2, HEIGHT // 2))
        self.screen.blit(mines_left_text, mines_left_rect)

        self.screen.blit(restart_text, restart_text_rect)
        pygame.display.flip()

        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    quit(0)
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if restart_button.collidepoint(event.pos):
                        return
            await asyncio.sleep(0)  # Yield control to the event loop

async def main():
    game = Game()
    while True:
        game.new()
        await game.run()

if __name__ == "__main__":
    asyncio.run(main())
