const std = @import("std");
const fs = std.fs;
const process = std.process;

const InitOptions = struct {
    version: []const u8 = "1.0",
    multi: bool = false,
    nick: ?[]const u8 = null,
    title: ?[]const u8 = null,
    description: ?[]const u8 = null,
    avatar: ?[]const u8 = null,
};

const initial_template =
    \\---
    \\version: "{s}"
    \\nick: "{s}"
    \\title: "{s}"
    \\description: "{s}"
    \\avatar: "{s}"
    \\---
    \\
    \\# About me
    \\An excited markdown.social user!
    \\
;

const new_post_template =
    \\
    \\---
    \\id: {s}
    \\---
    \\
    \\Dear markdown social, today I learned...
    \\
    \\
;

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const args = try process.argsAlloc(allocator);
    defer process.argsFree(allocator, args);

    if (args.len < 2) {
        try printUsage();
        return;
    }

    const command = args[1];

    if (std.mem.eql(u8, command, "init")) {
        const options = try parseInitOptions(args[2..]);
        try initCommand(allocator, options);
    } else if (std.mem.eql(u8, command, "add")) {
        try addCommand(allocator);
    } else if (std.mem.eql(u8, command, "help") or std.mem.eql(u8, command, "--help")) {
        try printUsage();
    } else {
        std.debug.print("Unknown command: {s}\n", .{command});
        try printUsage();
        return error.UnknownCommand;
    }
}

fn parseInitOptions(args: [][:0]u8) !InitOptions {
    var options = InitOptions{};
    var i: usize = 0;

    while (i < args.len) : (i += 1) {
        const arg = args[i];

        if (std.mem.eql(u8, arg, "--multi")) {
            options.multi = true;
        } else if (std.mem.eql(u8, arg, "--nick")) {
            i += 1;
            if (i >= args.len) return error.MissingValue;
            options.nick = args[i];
        } else if (std.mem.eql(u8, arg, "--title")) {
            i += 1;
            if (i >= args.len) return error.MissingValue;
            options.title = args[i];
        } else if (std.mem.eql(u8, arg, "--description")) {
            i += 1;
            if (i >= args.len) return error.MissingValue;
            options.description = args[i];
        } else if (std.mem.eql(u8, arg, "--avatar")) {
            i += 1;
            if (i >= args.len) return error.MissingValue;
            options.avatar = args[i];
        } else {
            std.debug.print("Unknown option: {s}\n", .{arg});
            return error.UnknownOption;
        }
    }

    return options;
}

fn printUsage() !void {
    std.debug.print(
        \\mds - Markdown Social CLI
        \\
        \\Usage:
        \\  mds init [OPTIONS]  Create a new social.md file
        \\  mds add             Add a new post to existing file
        \\  mds help            Show this help message
        \\
        \\Init Options:
        \\  --multi                Create social.md/ directory structure
        \\  --nick NAME            Set nickname (default: "yourname")
        \\  --title TITLE          Set title (default: "Your Social Stream")
        \\  --description TEXT     Set description (default: "My thoughts and updates")
        \\  --avatar URL           Set avatar URL (default: "")
        \\
        \\Examples:
        \\  mds init --nick johndoe --title "John's Blog"
        \\  mds init --multi --nick alice --description "Alice's updates"
        \\  mds add
        \\
    , .{});
}

fn initCommand(allocator: std.mem.Allocator, options: InitOptions) !void {
    const cwd = fs.cwd();

    if (options.multi) {
        cwd.makeDir("social.md") catch |err| {
            if (err != error.PathAlreadyExists) return err;
            std.debug.print("Directory social.md/ already exists\n", .{});
            return error.AlreadyExists;
        };

        const file_path = "social.md/index.md";
        try createInitialFile(allocator, file_path, options);
        std.debug.print("Created {s}\n", .{file_path});
        try openEditor(allocator, file_path);
    } else {
        const file_path = "social.md";

        if (cwd.access(file_path, .{})) {
            std.debug.print("File {s} already exists\n", .{file_path});
            return error.AlreadyExists;
        } else |_| {}

        try createInitialFile(allocator, file_path, options);
        std.debug.print("Created {s}\n", .{file_path});
        try openEditor(allocator, file_path);
    }
}

fn createInitialFile(allocator: std.mem.Allocator, path: []const u8, options: InitOptions) !void {
    const timestamp = try getCurrentTimestamp(allocator);
    defer allocator.free(timestamp);

    const version = options.version;
    const nick = options.nick orelse "yourname";
    const title = options.title orelse "Your Social Stream";
    const description = options.description orelse "My thoughts and updates";
    const avatar = options.avatar orelse "";

    const content = try std.fmt.allocPrint(allocator, initial_template, .{ version, nick, title, description, avatar });
    defer allocator.free(content);

    const file = try fs.cwd().createFile(path, .{});
    defer file.close();

    try file.writeAll(content);
}

fn addCommand(allocator: std.mem.Allocator) !void {
    const cwd = fs.cwd();

    const file_path = if (cwd.access("social.md/index.md", .{})) |_|
        "social.md/index.md"
    else |_| blk: {
        if (cwd.access("social.md", .{})) |_| {
            break :blk "social.md";
        } else |_| {
            std.debug.print("No social.md or social.md/index.md found. Run 'mds init' first.\n", .{});
            return error.FileNotFound;
        }
    };

    const file = try cwd.openFile(file_path, .{ .mode = .read_write });
    defer file.close();

    const stat = try file.stat();
    const existing_content = try file.readToEndAlloc(allocator, stat.size);
    defer allocator.free(existing_content);

    const timestamp = try getCurrentTimestamp(allocator);
    defer allocator.free(timestamp);

    const new_post = try std.fmt.allocPrint(allocator, new_post_template, .{timestamp});
    defer allocator.free(new_post);

    const updated_content = try std.mem.concat(allocator, u8, &.{ existing_content, new_post });
    defer allocator.free(updated_content);

    try file.seekTo(0);
    try file.setEndPos(0);
    try file.writeAll(updated_content);

    std.debug.print("Added new post to {s}\n", .{file_path});
    try openEditor(allocator, file_path);
}

fn getCurrentTimestamp(allocator: std.mem.Allocator) ![]u8 {
    const ts = std.time.timestamp();
    const epoch_seconds: i64 = @intCast(ts);

    const epoch_day = std.time.epoch.EpochSeconds{ .secs = @intCast(epoch_seconds) };
    const epoch_day_seconds = epoch_day.getEpochDay();
    const year_day = epoch_day_seconds.calculateYearDay();
    const month_day = year_day.calculateMonthDay();

    const seconds_today = @as(u64, @intCast(@mod(epoch_seconds, 86400)));
    const hours = @divTrunc(seconds_today, 3600);
    const minutes = @divTrunc(@mod(seconds_today, 3600), 60);
    const seconds = @mod(seconds_today, 60);

    return std.fmt.allocPrint(allocator, "{d:0>4}-{d:0>2}-{d:0>2}T{d:0>2}:{d:0>2}:{d:0>2}Z", .{
        year_day.year,
        month_day.month.numeric(),
        month_day.day_index + 1,
        hours,
        minutes,
        seconds,
    });
}

fn openEditor(allocator: std.mem.Allocator, file_path: []const u8) !void {
    const editor = std.process.getEnvVarOwned(allocator, "EDITOR") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            std.debug.print("$EDITOR not set. Please edit {s} manually.\n", .{file_path});
            return;
        }
        return err;
    };
    defer allocator.free(editor);

    var child = process.Child.init(&.{ editor, file_path }, allocator);
    _ = try child.spawnAndWait();
}
