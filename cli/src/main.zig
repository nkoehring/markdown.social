const std = @import("std");
const fs = std.fs;
const process = std.process;

const mds = @import("root.zig");

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
        try mds.initializeFeed(allocator, options);
    } else if (std.mem.eql(u8, command, "add")) {
        try mds.addPost(allocator, file_path);
    } else if (std.mem.eql(u8, command, "help") or std.mem.eql(u8, command, "--help")) {
        try printUsage();
    } else {
        std.debug.print("Unknown command: {s}\n", .{command});
        try printUsage();
        return error.UnknownCommand;
    }
}

fn parseInitOptions(args: [][:0]u8) !mds.InitOptions {
    var options = mds.InitOptions{};
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

fn getFilePath(path: []const u8) ![]const u8 {
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
}

fn parseAddOptions(args: [][:0]u8) !mds.AddOptions {
    var options = mds.AddOptions{};
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
