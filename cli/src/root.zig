const std = @import("std");
const fs = std.fs;
const process = std.process;

pub const feed_template =
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

pub const post_template =
    \\
    \\---
    \\id: {s}
    \\---
    \\
    \\Dear markdown social, today I learned...
    \\
    \\
;

pub const InitOptions = struct {
    outputPath: []const u8 = '.',
    version: []const u8 = "1.0",
    multi: bool = false,
    nick: ?[]const u8 = null,
    title: ?[]const u8 = null,
    description: ?[]const u8 = null,
    avatar: ?[]const u8 = null,
};

pub const AddOptions = struct {
    path: ?[]const u8 = null,
}

pub fn initializeFeed(allocator: std.mem.Allocator, options: InitOptions) !void {
    const cwd = fs.cwd();
    const working_dir = try cwd.makeOpenPath(options.outputPath, .{});
    defer working_dir.close();

    if (options.multi) {
        working_dir.makeDir("social.md") catch |err| {
            if (err != error.PathAlreadyExists) return err;
            std.debug.print("Directory social.md/ already exists\n", .{});
        };

        const file_path = "social.md/index.md";
        try createInitialFile(allocator, file_path, options);
        std.debug.print("Created {s}\n", .{file_path});
        try openEditor(allocator, file_path);
    } else {
        const file_path = "social.md";

        if (working_dir.access(file_path, .{})) {
            std.debug.print("File {s} already exists\n", .{file_path});
            return error.AlreadyExists;
        } else |_| {}

        try createInitialFile(allocator, file_path, options);
        std.debug.print("Created {s}\n", .{file_path});
        try openEditor(allocator, file_path);
    }
}

pub fn addPost(allocator: std.mem.Allocator, file_path: []const u8) !void {
    const cwd = fs.cwd();

    const file = try cwd.openFile(file_path, .{ .mode = .read_write });
    defer file.close();

    const stat = try file.stat();
    const existing_content = try file.readToEndAlloc(allocator, stat.size);
    defer allocator.free(existing_content);

    const timestamp = try mds.getCurrentTimestamp(allocator);
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

pub fn getCurrentTimestamp(allocator: std.mem.Allocator) ![]u8 {
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

fn createInitialFile(allocator: std.mem.Allocator, path: []const u8, options: InitOptions) !void {
    const file = try fs.cwd().createFile(path, .{});
    defer file.close();

    const timestamp = try getCurrentTimestamp(allocator);
    defer allocator.free(timestamp);

    const version = options.version;
    const nick = options.nick orelse "yourname";
    const title = options.title orelse "Your Social Stream";
    const description = options.description orelse "My thoughts and updates";
    const avatar = options.avatar orelse "";

    const content = try std.fmt.allocPrint(allocator, initial_template, .{ version, nick, title, description, avatar });
    defer allocator.free(content);

    try file.writeAll(content);
}
